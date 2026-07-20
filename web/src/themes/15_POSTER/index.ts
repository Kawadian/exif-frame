import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox, { getContainInsets } from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import * as CommonOptions from '../common-options';

const POSTER_OPTIONS: ThemeOption[] = [
  CommonOptions.createAspectRatioOption(),
  CommonOptions.createDarkModeOption(false),
  CommonOptions.createBlurBackgroundOption(),
  CommonOptions.createBlurAmountOption(),
  CommonOptions.createPaddingTopOption(400),
  CommonOptions.createPaddingBottomOption(400),
  CommonOptions.createPaddingLeftOption(150),
  CommonOptions.createPhotoBorderWidthOption(0),
  CommonOptions.createPhotoBorderColorOption('#000000'),
  CommonOptions.createShadowOffsetXOption(0),
  CommonOptions.createShadowOffsetYOption(0),
  CommonOptions.createShadowBlurOption(0),
  CommonOptions.createShadowColorOption('#000000'),
  CommonOptions.createShadowOpacityOption(0.5),
  CommonOptions.createText1Option('2001.01.01'),
  CommonOptions.createText2Option('Lorem Ipsum'),
  CommonOptions.createText3Option('dolor sit amet, consectetur'),
  CommonOptions.createText4Option('White House'),
  CommonOptions.createText5Option('1600 Pennsylvania Avenue NW, Washington, DC 20500'),
  CommonOptions.createCustomSizeOption('TEXT1_SIZE', 80, 'px'),
  CommonOptions.createCustomWeightOption('TEXT1_WEIGHT', 300, '100 ~ 900'),
  CommonOptions.createCustomSizeOption('TEXT2_SIZE', 200, 'px'),
  CommonOptions.createCustomWeightOption('TEXT2_WEIGHT', 500, '100 ~ 900'),
  CommonOptions.createCustomSizeOption('TEXT3_SIZE', 200, 'px'),
  CommonOptions.createCustomWeightOption('TEXT3_WEIGHT', 500, '100 ~ 900'),
  CommonOptions.createCustomSizeOption('TEXT4_SIZE', 150, 'px'),
  CommonOptions.createCustomWeightOption('TEXT4_WEIGHT', 500, '100 ~ 900'),
  CommonOptions.createCustomSizeOption('TEXT5_SIZE', 80, 'px'),
  CommonOptions.createCustomWeightOption('TEXT5_WEIGHT', 300, '100 ~ 900'),
  CommonOptions.createFontFamilyOption('Barlow'),
  CommonOptions.createShadowSizeOption(10),
];

const POSTER_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const ASPECT_RATIO = (input.get('ASPECT_RATIO') as string).trim();
  const DARK_MODE = input.get('DARK_MODE') as boolean;
  const BLUR_BACKGROUND = input.get('BLUR_BACKGROUND') as boolean;
  const BLUR_AMOUNT = input.get('BLUR_AMOUNT') as number;
  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = input.get('PADDING_BOTTOM') as number;
  const PADDING_LEFT = input.get('PADDING_LEFT') as number;
  const PHOTO_BORDER_WIDTH = input.get('PHOTO_BORDER_WIDTH') as number;
  const PHOTO_BORDER_COLOR = (input.get('PHOTO_BORDER_COLOR') as string).trim();
  const SHADOW_OFFSET_X = input.get('SHADOW_OFFSET_X') as number;
  const SHADOW_OFFSET_Y = input.get('SHADOW_OFFSET_Y') as number;
  const SHADOW_BLUR = input.get('SHADOW_BLUR') as number;
  const SHADOW_COLOR = (input.get('SHADOW_COLOR') as string).trim();
  const SHADOW_OPACITY = input.get('SHADOW_OPACITY') as number;
  const TEXT1 = (input.get('TEXT1') as string).trim();
  const TEXT2 = (input.get('TEXT2') as string).trim();
  const TEXT3 = (input.get('TEXT3') as string).trim();
  const TEXT4 = (input.get('TEXT4') as string).trim();
  const TEXT5 = (input.get('TEXT5') as string).trim();
  const TEXT1_SIZE = input.get('TEXT1_SIZE') as number;
  const TEXT1_WEIGHT = input.get('TEXT1_WEIGHT') as number;
  const TEXT2_SIZE = input.get('TEXT2_SIZE') as number;
  const TEXT2_WEIGHT = input.get('TEXT2_WEIGHT') as number;
  const TEXT3_SIZE = input.get('TEXT3_SIZE') as number;
  const TEXT3_WEIGHT = input.get('TEXT3_WEIGHT') as number;
  const TEXT4_SIZE = input.get('TEXT4_SIZE') as number;
  const TEXT4_WEIGHT = input.get('TEXT4_WEIGHT') as number;
  const TEXT5_SIZE = input.get('TEXT5_SIZE') as number;
  const TEXT5_WEIGHT = input.get('TEXT5_WEIGHT') as number;
  const FONT_FAMILY = (input.get('FONT_FAMILY') as string).trim();
  const actualFontFamily = FONT_FAMILY === 'Default' ? 'sans-serif' : FONT_FAMILY;
  const SHADOW_SIZE = input.get('SHADOW_SIZE') as number;

  const padding = { top: 0, right: 0, bottom: 0, left: 0 };
  const { canvas, imageRect } = sandbox(photo, {
    targetRatio: ASPECT_RATIO,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: DARK_MODE ? '#ffffff' : '#000000',
    padding,
    blurBackground: BLUR_BACKGROUND ? { amount: BLUR_AMOUNT } : undefined,
    photoBorder: PHOTO_BORDER_WIDTH > 0 ? { width: PHOTO_BORDER_WIDTH, color: PHOTO_BORDER_COLOR } : undefined,
    shadow: SHADOW_BLUR > 0 ? { offsetX: SHADOW_OFFSET_X, offsetY: SHADOW_OFFSET_Y, blur: SHADOW_BLUR, color: SHADOW_COLOR, opacity: SHADOW_OPACITY } : undefined,
  });
  const insets = getContainInsets(canvas, padding, imageRect);

  const context = canvas.getContext('2d')!;
  context.fillStyle = DARK_MODE ? '#000000' : '#ffffff';
  context.shadowColor = DARK_MODE ? '#ffffff' : '#000000';
  context.shadowBlur = SHADOW_SIZE;
  context.textBaseline = 'middle';
  context.textAlign = 'left';

  context.font = `normal ${TEXT1_WEIGHT} ${TEXT1_SIZE}px ${actualFontFamily}`;
  context.fillText(TEXT1, PADDING_LEFT, PADDING_TOP + insets.top);

  context.font = `normal ${TEXT2_WEIGHT} ${TEXT2_SIZE}px ${actualFontFamily}`;
  context.fillText(TEXT2, PADDING_LEFT, PADDING_TOP + TEXT1_SIZE * 2 + insets.top);

  context.font = `normal ${TEXT3_WEIGHT} ${TEXT3_SIZE}px ${actualFontFamily}`;
  context.fillText(TEXT3, PADDING_LEFT, PADDING_TOP + TEXT1_SIZE * 2 + TEXT2_SIZE * 1.2 + insets.top);

  context.font = `normal ${TEXT4_WEIGHT} ${TEXT4_SIZE}px ${actualFontFamily}`;
  context.fillText(TEXT4, PADDING_LEFT, canvas.height - PADDING_BOTTOM - TEXT5_SIZE * 1.5 - insets.bottom);

  context.font = `normal ${TEXT5_WEIGHT} ${TEXT5_SIZE}px ${actualFontFamily}`;
  context.fillText(TEXT5, PADDING_LEFT, canvas.height - PADDING_BOTTOM - insets.bottom);

  return canvas;
};

export { POSTER_FUNC, POSTER_OPTIONS };
