import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import * as CommonOptions from '../common-options';

const SHOT_ON_ONE_LINE_OPTIONS: ThemeOption[] = [
  CommonOptions.createBackgroundColorOption('#ffffff'),
  CommonOptions.createBlurBackgroundOption(),
  CommonOptions.createBlurAmountOption(),
  CommonOptions.createTextColorOption('#000000'),
  CommonOptions.createPaddingTopOption(0),
  CommonOptions.createPaddingBottomOption(0),
  CommonOptions.createPaddingLeftOption(0),
  CommonOptions.createPaddingRightOption(0),
];

const SHOT_ON_ONE_LINE_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const BACKGROUND_COLOR = (input.get('BACKGROUND_COLOR') as string).trim();
  const BLUR_BACKGROUND = input.get('BLUR_BACKGROUND') as boolean;
  const BLUR_AMOUNT = input.get('BLUR_AMOUNT') as number;
  const TEXT_COLOR = input.get('TEXT_COLOR') as string;
  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = (input.get('PADDING_BOTTOM') as number) + 200;
  const PADDING_LEFT = input.get('PADDING_LEFT') as number;
  const PADDING_RIGHT = input.get('PADDING_RIGHT') as number;
  const FONT_SIZE = 70;

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
  context.font = `normal 100 ${FONT_SIZE}px Barlow`;
  context.textAlign = 'right';

  if (!store.disableExposureMeter) {
    context.fillText(
      [`${photo.iso}`, `${photo.focalLength}`, `${photo.fNumber}`, `${photo.exposureTime}`]
        .filter(Boolean)
        .map((value) => value.trim())
        .join('  '),
      canvas.width - FONT_SIZE,
      canvas.height - PADDING_BOTTOM / 2
    );
  }

  context.textAlign = 'left';
  context.font = `normal 100 ${FONT_SIZE}px Barlow`;
  context.fillText(`Shot on  `, FONT_SIZE, canvas.height - PADDING_BOTTOM / 2);
  const shotOnWidth = context.measureText('Shot on  ').width;

  context.font = `normal 500 ${FONT_SIZE}px Barlow`;
  context.fillText(
    [photo.make, photo.model, photo.lensModel]
      .filter(Boolean)
      .map((value) => value!.trim())
      .join(' '),
    shotOnWidth + FONT_SIZE,
    canvas.height - PADDING_BOTTOM / 2
  );

  return canvas;
};

export { SHOT_ON_ONE_LINE_FUNC, SHOT_ON_ONE_LINE_OPTIONS };
