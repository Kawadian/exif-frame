import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import { ASPECT_RATIO_OPTIONS } from '../../constants/aspect-ratios';
import * as CommonOptions from '../common-options';

const SHOT_CARD_OPTIONS: ThemeOption[] = [
  { id: 'ASPECT_RATIO', type: 'select', options: ASPECT_RATIO_OPTIONS, default: 'free', description: 'theme.option.aspect-ratio' },
  CommonOptions.createBackgroundColorOption('#f3f2ef'),
  CommonOptions.createBlurBackgroundOption(),
  CommonOptions.createBlurAmountOption(),
  CommonOptions.createPaddingInsideOption(false),
  CommonOptions.createPaddingTopOption(220),
  CommonOptions.createPaddingBottomOption(180),
  CommonOptions.createPaddingLeftOption(140),
  CommonOptions.createPaddingRightOption(140),
  CommonOptions.createPhotoBorderWidthOption(0),
  CommonOptions.createPhotoBorderColorOption('#ffffff'),
  CommonOptions.createShowShadowOption(true),
  CommonOptions.createShadowOffsetXOption(0),
  CommonOptions.createShadowOffsetYOption(28),
  CommonOptions.createShadowBlurOption(48),
  CommonOptions.createShadowColorOption('#000000'),
  CommonOptions.createShadowOpacityOption(0.18),
  CommonOptions.createTextColorOption('#2c2c2c'),
  CommonOptions.createTextAlphaOption(0.9),
  CommonOptions.createTextAlignOption('center'),
  CommonOptions.createFontStyleOption('normal'),
  CommonOptions.createFontWeightOption(500),
  CommonOptions.createFontSizeOption(44),
  CommonOptions.createFontFamilyOption('Barlow'),
  CommonOptions.createLetterSpacingOption(14),
  CommonOptions.createTextToPhotoGapOption(72),
  CommonOptions.createDividerOption('|'),
  { id: 'TEMPLATE', type: 'string', default: '{MM}{F}{SEC}{ISO}', description: 'theme.option.template1' },
  CommonOptions.createHideTextOption(false),
];

const actualFontFamily = (fontFamily: string) => (fontFamily === 'Default' ? 'sans-serif' : fontFamily);

const buildMetadataText = (photo: Photo, store: Store, template: string, divider: string) => {
  const parts = template
    .split('}')
    .map((part) => `${part}}`)
    .map((part) =>
      part
        .replace(/{MAKER}/g, photo.make)
        .replace(/{BODY}/g, photo.model || '')
        .replace(/{LENS}/g, photo.lensModel || '')
        .replace(/{ISO}/g, store.disableExposureMeter ? '' : photo.iso || '')
        .replace(/{MM}/g, store.disableExposureMeter ? '' : photo.focalLength || '')
        .replace(/{F}/g, store.disableExposureMeter ? '' : photo.fNumber || '')
        .replace(/{SEC}/g, store.disableExposureMeter ? '' : photo.exposureTime || '')
        .replace(/{TAKEN_AT}/g, photo.takenAt || '')
        .replace(/}/g, '')
    )
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.join(` ${divider} `).replace(/\s+/g, ' ').trim().toUpperCase();
};

const measureSpacedTextWidth = (context: CanvasRenderingContext2D, text: string, letterSpacing: number) => {
  if (!text) return 0;

  const chars = Array.from(text);
  let width = 0;

  for (let i = 0; i < chars.length; i += 1) {
    width += context.measureText(chars[i]).width;
    if (i < chars.length - 1) width += letterSpacing;
  }

  return width;
};

const drawSpacedText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, letterSpacing: number, align: CanvasTextAlign, maxWidth: number) => {
  if (!text) return;

  let nextSpacing = Math.max(0, letterSpacing);
  let totalWidth = measureSpacedTextWidth(context, text, nextSpacing);

  while (totalWidth > maxWidth && nextSpacing > 0) {
    nextSpacing -= 1;
    totalWidth = measureSpacedTextWidth(context, text, nextSpacing);
  }

  const chars = Array.from(text);
  let cursorX = align === 'left' ? x : align === 'right' ? x - totalWidth : x - totalWidth / 2;
  const previousAlign = context.textAlign;
  context.textAlign = 'left';

  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];
    context.fillText(char, cursorX, y);
    cursorX += context.measureText(char).width + (i < chars.length - 1 ? nextSpacing : 0);
  }

  context.textAlign = previousAlign;
};

const SHOT_CARD_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const ASPECT_RATIO = (input.get('ASPECT_RATIO') as string).trim();
  const BACKGROUND_COLOR = (input.get('BACKGROUND_COLOR') as string).trim();
  const BLUR_BACKGROUND = input.get('BLUR_BACKGROUND') as boolean;
  const BLUR_AMOUNT = input.get('BLUR_AMOUNT') as number;
  const PADDING_INSIDE = input.get('PADDING_INSIDE') as boolean;
  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = input.get('PADDING_BOTTOM') as number;
  const PADDING_LEFT = input.get('PADDING_LEFT') as number;
  const PADDING_RIGHT = input.get('PADDING_RIGHT') as number;
  const PHOTO_BORDER_WIDTH = input.get('PHOTO_BORDER_WIDTH') as number;
  const PHOTO_BORDER_COLOR = (input.get('PHOTO_BORDER_COLOR') as string).trim();
  const SHOW_SHADOW = input.get('SHOW_SHADOW') as boolean;
  const SHADOW_OFFSET_X = input.get('SHADOW_OFFSET_X') as number;
  const SHADOW_OFFSET_Y = input.get('SHADOW_OFFSET_Y') as number;
  const SHADOW_BLUR = input.get('SHADOW_BLUR') as number;
  const SHADOW_COLOR = (input.get('SHADOW_COLOR') as string).trim();
  const SHADOW_OPACITY = input.get('SHADOW_OPACITY') as number;
  const TEXT_COLOR = input.get('TEXT_COLOR') as string;
  const TEXT_ALPHA = input.get('TEXT_ALPHA') as number;
  const TEXT_ALIGN = (input.get('TEXT_ALIGN') as string).trim() as CanvasTextAlign;
  const FONT_STYLE = (input.get('FONT_STYLE') as string).trim();
  const FONT_WEIGHT = input.get('FONT_WEIGHT') as number;
  const FONT_SIZE = input.get('FONT_SIZE') as number;
  const FONT_FAMILY = (input.get('FONT_FAMILY') as string).trim();
  const LETTER_SPACING = input.get('LETTER_SPACING') as number;
  const TEXT_TO_PHOTO_GAP = input.get('TEXT_TO_PHOTO_GAP') as number;
  const DIVIDER = (input.get('DIVIDER') as string).trim() || '|';
  const TEMPLATE = (input.get('TEMPLATE') as string).trim();
  const HIDE_TEXT = input.get('HIDE_TEXT') as boolean;

  const canvas = sandbox(photo, {
    targetRatio: ASPECT_RATIO,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: BACKGROUND_COLOR,
    padding: PADDING_INSIDE ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
    blurBackground: BLUR_BACKGROUND ? { amount: BLUR_AMOUNT } : undefined,
    photoBorder: PHOTO_BORDER_WIDTH > 0 ? { width: PHOTO_BORDER_WIDTH, color: PHOTO_BORDER_COLOR } : undefined,
    shadow: SHOW_SHADOW && SHADOW_BLUR > 0 ? { offsetX: SHADOW_OFFSET_X, offsetY: SHADOW_OFFSET_Y, blur: SHADOW_BLUR, color: SHADOW_COLOR, opacity: SHADOW_OPACITY } : undefined,
  });

  if (HIDE_TEXT || PADDING_INSIDE) return canvas;

  const context = canvas.getContext('2d')!;
  const text = buildMetadataText(photo, store, TEMPLATE, DIVIDER);
  if (!text) return canvas;

  const availableWidth = Math.max(1, canvas.width - PADDING_LEFT - PADDING_RIGHT);
  const textX = TEXT_ALIGN === 'left' ? PADDING_LEFT : TEXT_ALIGN === 'right' ? canvas.width - PADDING_RIGHT : canvas.width / 2;
  const textY = Math.max(FONT_SIZE, PADDING_TOP - Math.max(0, TEXT_TO_PHOTO_GAP));

  context.save();
  context.fillStyle = TEXT_COLOR;
  context.globalAlpha = TEXT_ALPHA;
  context.textBaseline = 'middle';
  context.font = `${FONT_STYLE} ${FONT_WEIGHT} ${FONT_SIZE}px ${actualFontFamily(FONT_FAMILY)}`;
  drawSpacedText(context, text, textX, textY, LETTER_SPACING, TEXT_ALIGN, availableWidth);
  context.restore();

  return canvas;
};

export { SHOT_CARD_FUNC, SHOT_CARD_OPTIONS };
