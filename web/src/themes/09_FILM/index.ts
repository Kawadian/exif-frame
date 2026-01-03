import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import * as CommonOptions from '../common-options';

const FILM_OPTIONS: ThemeOption[] = [
  CommonOptions.createArtistOption(''),
  CommonOptions.createFontFamilyOption('digital-7'),
  CommonOptions.createTextColorOption('#FFA500'),
  CommonOptions.createTextAlphaOption(1),
  CommonOptions.createBackgroundColorOption('#000000'),
  CommonOptions.createBlurBackgroundOption(),
  CommonOptions.createBlurAmountOption(),
  CommonOptions.createPaddingTopOption(0),
  CommonOptions.createPaddingBottomOption(0),
  CommonOptions.createPaddingLeftOption(0),
  CommonOptions.createPaddingRightOption(0),
];

const FILM_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const ARTIST = (input.get('ARTIST') as string).trim();
  const FONT_FAMILY = (input.get('FONT_FAMILY') as string).trim();
  const actualFontFamily = FONT_FAMILY === 'Default' ? 'sans-serif' : FONT_FAMILY;
  const TEXT_COLOR = input.get('TEXT_COLOR') as string;
  const TEXT_ALPHA = input.get('TEXT_ALPHA') as number;
  const BACKGROUND_COLOR = (input.get('BACKGROUND_COLOR') as string).trim();
  const BLUR_BACKGROUND = input.get('BLUR_BACKGROUND') as boolean;
  const BLUR_AMOUNT = input.get('BLUR_AMOUNT') as number;
  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = input.get('PADDING_BOTTOM') as number;
  const PADDING_LEFT = input.get('PADDING_LEFT') as number;
  const PADDING_RIGHT = input.get('PADDING_RIGHT') as number;

  const canvas = sandbox(photo, {
    targetRatio: store.ratio,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: BACKGROUND_COLOR,
    padding: { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
    blurBackground: BLUR_BACKGROUND ? { amount: BLUR_AMOUNT } : undefined,
  });

  const context = canvas.getContext('2d')!;
  context.fillStyle = TEXT_COLOR;
  context.textBaseline = 'bottom';
  context.globalAlpha = TEXT_ALPHA;

  if (!store.disableExposureMeter) {
    const datas = [
      ...(photo.iso ? [{ key: 'ISO', value: photo.iso.replace('ISO', '') }] : []),
      ...(photo.exposureTime ? [{ key: 'SEC', value: photo.exposureTime.replace('s', '') }] : []),
      ...(photo.fNumber ? [{ key: 'F', value: photo.fNumber.replace('F', '') }] : []),
    ];

    context.textAlign = 'right';
    context.font = `100px ${actualFontFamily}`;
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      context.fillText(data.value, canvas.width - 100, canvas.height - 100 - i * 100);
      const width = context.measureText(data.value).width;
      context.font = `60px ${actualFontFamily}`;
      context.fillText(data.key, canvas.width - 100 - width - 20, canvas.height - 110 - i * 100);
      context.font = `100px ${actualFontFamily}`;
    }
  }

  context.font = `70px ${actualFontFamily}`;
  context.textAlign = 'left';
  context.fillText(
    [store.showLensModel ? store.overrideLensModel || photo.lensModel : null]
      .filter(Boolean)
      .map((value) => value!.trim())
      .join(' '),
    100,
    canvas.height - 105
  );
  context.fillText(
    [store.showCameraMaker ? store.overrideCameraMaker || photo.make : null, store.showCameraModel ? store.overrideCameraModel || photo.model : null]
      .filter(Boolean)
      .map((value) => value!.trim())
      .join(' '),
    100,
    canvas.height - 205
  );
  context.font = `50px ${actualFontFamily}`;
  context.fillText(ARTIST ? ARTIST : photo.takenAt, 100, canvas.height - 305);

  context.globalAlpha = 1;

  return canvas;
};

export { FILM_FUNC, FILM_OPTIONS };
