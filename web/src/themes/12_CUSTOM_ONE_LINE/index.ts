import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import * as CommonOptions from '../common-options';

const CUSTOM_ONE_LINE_OPTIONS: ThemeOption[] = [
  CommonOptions.createAspectRatioOption(),
  CommonOptions.createBackgroundColorOption('#ffffff'),
  CommonOptions.createBlurBackgroundOption(),
  CommonOptions.createBlurAmountOption(),
  CommonOptions.createPaddingInsideOption(true),
  CommonOptions.createPaddingTopOption(100),
  CommonOptions.createPaddingBottomOption(250),
  CommonOptions.createPaddingLeftOption(100),
  CommonOptions.createPaddingRightOption(100),
  CommonOptions.createPhotoBorderWidthOption(0),
  CommonOptions.createPhotoBorderColorOption('#000000'),
  CommonOptions.createShadowOffsetXOption(0),
  CommonOptions.createShadowOffsetYOption(0),
  CommonOptions.createShadowBlurOption(0),
  CommonOptions.createShadowColorOption('#000000'),
  CommonOptions.createShadowOpacityOption(0.5),
  CommonOptions.createTextOption('Your Text'),
  CommonOptions.createTextAlphaOption(1),
  CommonOptions.createTextColorOption('#ffffff'),
  CommonOptions.createTextAlignOption('center'),
  CommonOptions.createFontStyleOption('normal'),
  CommonOptions.createFontWeightOption(300),
  CommonOptions.createFontSizeOption(70),
  CommonOptions.createFontFamilyOption('Barlow'),
];

const CUSTOM_ONE_LINE_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const ASPECT_RATIO = (input.get('ASPECT_RATIO') as string).trim();
  const BACKGROUND_COLOR = (input.get('BACKGROUND_COLOR') as string).trim();
  const BLUR_BACKGROUND = input.get('BLUR_BACKGROUND') as boolean;
  const BLUR_AMOUNT = input.get('BLUR_AMOUNT') as number;
  const PADDING_INSIDE = input.get('PADDING_INSIDE') as boolean;
  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = input.get('PADDING_BOTTOM') as number;
  const PADDING_LEFT = input.get('PADDING_LEFT') as number;
  const PADDING_RIGHT = input.get('PADDING_RIGHT') as number;
  const TEXT = input.get('TEXT') as string;
  const TEXT_ALPHA = input.get('TEXT_ALPHA') as number;
  const TEXT_COLOR = input.get('TEXT_COLOR') as string;
  const TEXT_ALIGN = (input.get('TEXT_ALIGN') as string).trim() as CanvasTextAlign;
  const FONT_STYLE = (input.get('FONT_STYLE') as string).trim();
  const FONT_WEIGHT = input.get('FONT_WEIGHT') as number;
  const FONT_SIZE = input.get('FONT_SIZE') as number;
  const FONT_FAMILY = (input.get('FONT_FAMILY') as string).trim();
  const actualFontFamily = FONT_FAMILY === 'Default' ? 'sans-serif' : FONT_FAMILY;
  const PHOTO_BORDER_WIDTH = input.get('PHOTO_BORDER_WIDTH') as number;
  const PHOTO_BORDER_COLOR = (input.get('PHOTO_BORDER_COLOR') as string).trim();
  const SHADOW_OFFSET_X = input.get('SHADOW_OFFSET_X') as number;
  const SHADOW_OFFSET_Y = input.get('SHADOW_OFFSET_Y') as number;
  const SHADOW_BLUR = input.get('SHADOW_BLUR') as number;
  const SHADOW_COLOR = (input.get('SHADOW_COLOR') as string).trim();
  const SHADOW_OPACITY = input.get('SHADOW_OPACITY') as number;

  const canvas = sandbox(photo, {
    targetRatio: ASPECT_RATIO,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: BACKGROUND_COLOR,
    padding: PADDING_INSIDE ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
    blurBackground: BLUR_BACKGROUND ? { amount: BLUR_AMOUNT } : undefined,
    photoBorder: PHOTO_BORDER_WIDTH > 0 ? { width: PHOTO_BORDER_WIDTH, color: PHOTO_BORDER_COLOR } : undefined,
    shadow: SHADOW_BLUR > 0 ? { offsetX: SHADOW_OFFSET_X, offsetY: SHADOW_OFFSET_Y, blur: SHADOW_BLUR, color: SHADOW_COLOR, opacity: SHADOW_OPACITY } : undefined,
  });

  const context = canvas.getContext('2d')!;
  context.fillStyle = TEXT_COLOR;
  context.textBaseline = 'middle';
  context.font = `${FONT_STYLE} ${FONT_WEIGHT} ${FONT_SIZE}px ${actualFontFamily}`;
  context.textAlign = TEXT_ALIGN as CanvasTextAlign;
  context.globalAlpha = TEXT_ALPHA;
  context.fillText(TEXT, TEXT_ALIGN === 'left' ? PADDING_LEFT : TEXT_ALIGN === 'center' ? canvas.width / 2 : canvas.width - PADDING_RIGHT, canvas.height - PADDING_BOTTOM / 2);
  context.globalAlpha = 1;

  return canvas;
};

export { CUSTOM_ONE_LINE_FUNC, CUSTOM_ONE_LINE_OPTIONS };
