import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import * as CommonOptions from '../common-options';

const MONITOR_OPTIONS: ThemeOption[] = [
  CommonOptions.createBackgroundColorOption('#000000'),
  CommonOptions.createBlurBackgroundOption(),
  CommonOptions.createBlurAmountOption(),
  CommonOptions.createPaddingInsideOption(false),
  CommonOptions.createCompactOption(false),
  CommonOptions.createPaddingTopOption(0),
  CommonOptions.createPaddingBottomOption(100),
  CommonOptions.createPaddingLeftOption(0),
  CommonOptions.createPaddingRightOption(0),
  CommonOptions.createTextColorOption('#ffffff'),
  CommonOptions.createFontStyleOption('normal'),
  CommonOptions.createFontWeightOption(500),
  CommonOptions.createFontSizeOption(70),
  CommonOptions.createFontFamilyOption('Barlow'),
];

const MONITOR_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const BACKGROUND_COLOR = (input.get('BACKGROUND_COLOR') as string).trim();
  const BLUR_BACKGROUND = input.get('BLUR_BACKGROUND') as boolean;
  const BLUR_AMOUNT = input.get('BLUR_AMOUNT') as number;
  const PADDING_INSIDE = input.get('PADDING_INSIDE') as boolean;
  const COMPACT = input.get('COMPACT') as boolean;
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
    padding: PADDING_INSIDE ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
    blurBackground: BLUR_BACKGROUND ? { amount: BLUR_AMOUNT } : undefined,
  });

  const context = canvas.getContext('2d')!;
  context.fillStyle = TEXT_COLOR;
  context.textBaseline = 'middle';
  context.font = `${FONT_STYLE} ${FONT_WEIGHT} ${FONT_SIZE}px ${actualFontFamily}`;
  context.textAlign = 'center';

  if (COMPACT) {
    const targetWidth = canvas.width / 2;
    if (!store.disableExposureMeter) {
      context.fillText(`${photo.fNumber?.replace('f/', 'F')}`, (canvas.width - targetWidth) / 2 + (targetWidth / 5) * 1, canvas.height - PADDING_BOTTOM / 2);
      context.fillText(`${photo.exposureTime}`, (canvas.width - targetWidth) / 2 + (targetWidth / 5) * 2, canvas.height - PADDING_BOTTOM / 2);
      context.fillText(`${photo.iso}`, (canvas.width - targetWidth) / 2 + (targetWidth / 5) * 3, canvas.height - PADDING_BOTTOM / 2);
      context.fillText(`${photo.focalLength}`, (canvas.width - targetWidth) / 2 + (targetWidth / 5) * 4, canvas.height - PADDING_BOTTOM / 2);
    }
  } else {
    if (!store.disableExposureMeter) {
      context.fillText(`${photo.fNumber?.replace('f/', 'F')}`, (canvas.width / 5) * 1, canvas.height - PADDING_BOTTOM / 2);
      context.fillText(`${photo.exposureTime}`, (canvas.width / 5) * 2, canvas.height - PADDING_BOTTOM / 2);
      context.fillText(`${photo.iso}`, (canvas.width / 5) * 3, canvas.height - PADDING_BOTTOM / 2);
      context.fillText(`${photo.focalLength}`, (canvas.width / 5) * 4, canvas.height - PADDING_BOTTOM / 2);
    }
  }

  return canvas;
};

export { MONITOR_FUNC, MONITOR_OPTIONS };
