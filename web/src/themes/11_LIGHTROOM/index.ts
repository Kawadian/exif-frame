import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import * as CommonOptions from '../common-options';

const LIGHTROOM_OPTIONS: ThemeOption[] = [
  CommonOptions.createBackgroundColorOption('#1f1f1f'),
  CommonOptions.createBlurBackgroundOption(),
  CommonOptions.createBlurAmountOption(),
  CommonOptions.createPaddingTopOption(50),
  CommonOptions.createPaddingBottomOption(150),
  CommonOptions.createPaddingLeftOption(50),
  CommonOptions.createPaddingRightOption(50),
  CommonOptions.createTextColorOption('#ffffff'),
  CommonOptions.createFontStyleOption('normal'),
  CommonOptions.createFontWeightOption(300),
  CommonOptions.createFontSizeOption(50),
  CommonOptions.createFontFamilyOption('Barlow'),
];

const LIGHTROOM_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const BACKGROUND_COLOR = (input.get('BACKGROUND_COLOR') as string).trim();
  const BLUR_BACKGROUND = input.get('BLUR_BACKGROUND') as boolean;
  const BLUR_AMOUNT = input.get('BLUR_AMOUNT') as number;
  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = input.get('PADDING_BOTTOM') as number;
  const PADDING_LEFT = input.get('PADDING_LEFT') as number;
  const PADDING_RIGHT = input.get('PADDING_RIGHT') as number;
  const TEXT_COLOR = input.get('TEXT_COLOR') as string;
  const FONT_STYLE = (input.get('FONT_STYLE') as string).trim();
  const FONT_WEIGHT = input.get('FONT_WEIGHT') as number;
  const FONT_SIZE = input.get('FONT_SIZE') as number;
  const FONT_FAMILY = (input.get('FONT_FAMILY') as string).trim();
  const actualFontFamily = FONT_FAMILY === 'Default' ? 'sans-serif' : FONT_FAMILY;

  const canvas = sandbox(photo, {
    targetRatio: store.ratio,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: BACKGROUND_COLOR,
    padding: { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
    blurBackground: BLUR_BACKGROUND ? { amount: BLUR_AMOUNT } : undefined,
  });

  const context = canvas.getContext('2d')!;
  context.fillStyle = TEXT_COLOR;
  context.textBaseline = 'middle';
  context.font = `${FONT_STYLE} ${FONT_WEIGHT} ${FONT_SIZE}px ${actualFontFamily}`;
  context.textAlign = 'left';

  if (!store.disableExposureMeter) {
    context.fillText([`${photo.iso}`, `${photo.exposureTime}`, photo.fNumber, `${photo.focalLength}`].join('    '), PADDING_LEFT, canvas.height - PADDING_BOTTOM / 2);
  }

  context.textAlign = 'center';
  context.fillText(
    [photo.make, photo.model, photo.lensModel]
      .filter(Boolean)
      .map((value) => value!.trim())
      .join('    '),
    canvas.width / 2,
    canvas.height - PADDING_BOTTOM / 2
  );

  context.textAlign = 'right';
  context.fillText(photo.takenAt, canvas.width - PADDING_RIGHT, canvas.height - PADDING_BOTTOM / 2);

  return canvas;
};

export { LIGHTROOM_FUNC, LIGHTROOM_OPTIONS };
