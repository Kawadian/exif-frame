import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import overrideExifMetadata from '../../core/exif-metadata/override-exif-metadata';
import { getCameraMakerLogo } from '../maker-logo';
import { ASPECT_RATIO_OPTIONS } from '../../constants/aspect-ratios';
import * as CommonOptions from '../common-options';

type TextAlign = 'left' | 'center' | 'right';
type LogoAlign = 'left' | 'center' | 'right';

type LayoutMetrics = {
  left: number;
  right: number;
  availableWidth: number;
  centerX: number;
  footerY: number;
  headerY: number;
  fontScale: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const baseOptions = (defaults: {
  aspectRatio: string;
  backgroundColor: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  textColor: string;
  textAlpha: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  label: string;
  divider: string;
  logoDarkMode: boolean;
  logoHeight: number;
  logoMaxWidth: number;
}): ThemeOption[] => [
  { id: 'ASPECT_RATIO', type: 'select', options: ASPECT_RATIO_OPTIONS, default: defaults.aspectRatio, description: 'theme.option.aspect-ratio' },
  CommonOptions.createBackgroundColorOption(defaults.backgroundColor),
  CommonOptions.createBlurBackgroundOption(),
  CommonOptions.createBlurAmountOption(),
  CommonOptions.createPaddingInsideOption(false),
  CommonOptions.createPaddingTopOption(defaults.paddingTop),
  CommonOptions.createPaddingBottomOption(defaults.paddingBottom),
  CommonOptions.createPaddingLeftOption(defaults.paddingLeft),
  CommonOptions.createPaddingRightOption(defaults.paddingRight),
  CommonOptions.createPhotoBorderWidthOption(0),
  CommonOptions.createPhotoBorderColorOption('#ffffff'),
  CommonOptions.createShadowOffsetXOption(0),
  CommonOptions.createShadowOffsetYOption(24),
  CommonOptions.createShadowBlurOption(0),
  CommonOptions.createShadowColorOption('#000000'),
  CommonOptions.createShadowOpacityOption(0.18),
  CommonOptions.createTextColorOption(defaults.textColor),
  CommonOptions.createTextAlphaOption(defaults.textAlpha),
  CommonOptions.createFontStyleOption('normal'),
  CommonOptions.createFontWeightOption(defaults.fontWeight),
  CommonOptions.createFontSizeOption(defaults.fontSize),
  CommonOptions.createFontFamilyOption(defaults.fontFamily),
  CommonOptions.createLabelOption(defaults.label),
  CommonOptions.createDividerOption(defaults.divider),
  CommonOptions.createShowLogoOption(true),
  CommonOptions.createLogoDarkModeOption(defaults.logoDarkMode),
  CommonOptions.createLogoHeightOption(defaults.logoHeight),
  CommonOptions.createLogoMaxWidthOption(defaults.logoMaxWidth),
];

const SOCIAL_GALLERY_OPTIONS = baseOptions({
  aspectRatio: 'free',
  backgroundColor: '#f7f3ea',
  paddingTop: 140,
  paddingBottom: 360,
  paddingLeft: 140,
  paddingRight: 140,
  textColor: '#171717',
  textAlpha: 0.92,
  fontSize: 58,
  fontFamily: 'Pretendard',
  fontWeight: 300,
  label: '@yourname',
  divider: '·',
  logoDarkMode: true,
  logoHeight: 72,
  logoMaxWidth: 260,
});

const SOCIAL_REEL_OPTIONS = baseOptions({
  aspectRatio: '9:16',
  backgroundColor: '#11100e',
  paddingTop: 128,
  paddingBottom: 300,
  paddingLeft: 96,
  paddingRight: 96,
  textColor: '#f4f1ea',
  textAlpha: 0.9,
  fontSize: 44,
  fontFamily: 'NotoSansJP-Regular',
  fontWeight: 300,
  label: 'PHOTO DIARY',
  divider: '/',
  logoDarkMode: false,
  logoHeight: 64,
  logoMaxWidth: 240,
});

const SOCIAL_EDITORIAL_OPTIONS = baseOptions({
  aspectRatio: '4:5',
  backgroundColor: '#fbfaf6',
  paddingTop: 260,
  paddingBottom: 240,
  paddingLeft: 160,
  paddingRight: 160,
  textColor: '#202020',
  textAlpha: 0.9,
  fontSize: 46,
  fontFamily: 'Lato-Regular',
  fontWeight: 300,
  label: 'FIELD NOTES',
  divider: '—',
  logoDarkMode: true,
  logoHeight: 66,
  logoMaxWidth: 250,
});

const getLogo = (photo: Photo, darkMode: boolean): HTMLImageElement | undefined => {
  const override = overrideExifMetadata();
  return getCameraMakerLogo({ darkMode, make: override?.make || photo.metadata.make, model: override?.model || photo.metadata.model });
};

const actualFontFamily = (fontFamily: string) => (fontFamily === 'Default' ? 'sans-serif' : fontFamily);

const compactCameraName = (photo: Photo) => [photo.make, photo.model].filter(Boolean).join(' ').trim();

const exposureLine = (photo: Photo, store: Store, divider: string) => {
  if (store.disableExposureMeter) return '';
  return [photo.focalLength, photo.fNumber, photo.exposureTime, photo.iso].filter(Boolean).join(` ${divider} `);
};

const metadataLine = (photo: Photo, store: Store, divider: string) => [exposureLine(photo, store, divider), photo.lensModel].filter(Boolean).join(` ${divider} `);

const setFont = (context: CanvasRenderingContext2D, input: ThemeOptionInput, size = input.get('FONT_SIZE') as number, weight = input.get('FONT_WEIGHT') as number) => {
  const FONT_STYLE = (input.get('FONT_STYLE') as string).trim();
  const FONT_FAMILY = actualFontFamily((input.get('FONT_FAMILY') as string).trim());
  context.font = `${FONT_STYLE} ${weight} ${size}px ${FONT_FAMILY}`;
};

const drawFittedText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, align: TextAlign, input: ThemeOptionInput, size: number, weight?: number) => {
  const fitWidth = Math.max(1, maxWidth);

  if (!text || fitWidth <= 1) return;

  let nextSize = size;
  context.textAlign = align;
  setFont(context, input, nextSize, weight);

  while (context.measureText(text).width > fitWidth && nextSize > 18) {
    nextSize -= 2;
    setFont(context, input, nextSize, weight);
  }

  context.fillText(text, x, y, fitWidth);
};

const drawLogo = (context: CanvasRenderingContext2D, logo: HTMLImageElement | undefined, x: number, y: number, height: number, maxWidth: number, align: LogoAlign): number => {
  if (!logo || !logo.complete || !logo.naturalWidth || !logo.naturalHeight) return 0;

  const width = Math.min(maxWidth, (logo.naturalWidth / logo.naturalHeight) * height);
  const drawX = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
  const drawY = clamp(y, height / 2, context.canvas.height - height / 2);
  context.drawImage(logo, drawX, drawY - height / 2, width, height);
  return width;
};

const drawBaseCanvas = (photo: Photo, input: ThemeOptionInput, store: Store) => {
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
  const SHADOW_OFFSET_X = input.get('SHADOW_OFFSET_X') as number;
  const SHADOW_OFFSET_Y = input.get('SHADOW_OFFSET_Y') as number;
  const SHADOW_BLUR = input.get('SHADOW_BLUR') as number;
  const SHADOW_COLOR = (input.get('SHADOW_COLOR') as string).trim();
  const SHADOW_OPACITY = input.get('SHADOW_OPACITY') as number;

  return sandbox(photo, {
    targetRatio: ASPECT_RATIO,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: BACKGROUND_COLOR,
    padding: PADDING_INSIDE ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
    blurBackground: BLUR_BACKGROUND ? { amount: BLUR_AMOUNT } : undefined,
    photoBorder: PHOTO_BORDER_WIDTH > 0 ? { width: PHOTO_BORDER_WIDTH, color: PHOTO_BORDER_COLOR } : undefined,
    shadow: SHADOW_BLUR > 0 ? { offsetX: SHADOW_OFFSET_X, offsetY: SHADOW_OFFSET_Y, blur: SHADOW_BLUR, color: SHADOW_COLOR, opacity: SHADOW_OPACITY } : undefined,
  });
};

const getLayoutMetrics = (canvas: HTMLCanvasElement, input: ThemeOptionInput): LayoutMetrics => {
  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = input.get('PADDING_BOTTOM') as number;
  const PADDING_LEFT = input.get('PADDING_LEFT') as number;
  const PADDING_RIGHT = input.get('PADDING_RIGHT') as number;
  const minSideInset = Math.max(48, Math.min(canvas.width, canvas.height) * 0.035);
  const maxSideInset = Math.max(minSideInset, canvas.width * 0.18);
  const left = clamp(PADDING_LEFT, minSideInset, maxSideInset);
  const right = clamp(PADDING_RIGHT, minSideInset, maxSideInset);
  const topBand = clamp(PADDING_TOP, 96, Math.max(96, canvas.height * 0.24));
  const bottomBand = clamp(PADDING_BOTTOM, 128, Math.max(128, canvas.height * 0.26));
  const fontScale = clamp(Math.min(canvas.width / 3000, canvas.height / 2400), 0.72, 1.08);

  return {
    left,
    right,
    availableWidth: Math.max(1, canvas.width - left - right),
    centerX: canvas.width / 2,
    footerY: clamp(canvas.height - bottomBand / 2, 96, canvas.height - 96),
    headerY: clamp(topBand / 2, 72, Math.max(72, canvas.height - 96)),
    fontScale,
  };
};

const scaled = (size: number, scale: number, multiplier = 1) => Math.max(18, Math.round(size * scale * multiplier));

const safeY = (canvas: HTMLCanvasElement, y: number, inset = 32) => clamp(y, inset, canvas.height - inset);

const prepareText = (canvas: HTMLCanvasElement, input: ThemeOptionInput) => {
  const context = canvas.getContext('2d')!;
  const TEXT_COLOR = input.get('TEXT_COLOR') as string;
  const TEXT_ALPHA = input.get('TEXT_ALPHA') as number;

  context.save();
  context.fillStyle = TEXT_COLOR;
  context.globalAlpha = TEXT_ALPHA;
  context.textBaseline = 'middle';

  return context;
};

const SOCIAL_GALLERY_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const canvas = drawBaseCanvas(photo, input, store);
  const context = prepareText(canvas, input);
  const FONT_SIZE = input.get('FONT_SIZE') as number;
  const LABEL = (input.get('LABEL') as string).trim();
  const DIVIDER = (input.get('DIVIDER') as string).trim();
  const SHOW_LOGO = input.get('SHOW_LOGO') as boolean;
  const LOGO_DARK_MODE = input.get('LOGO_DARK_MODE') as boolean;
  const LOGO_HEIGHT = input.get('LOGO_HEIGHT') as number;
  const LOGO_MAX_WIDTH = input.get('LOGO_MAX_WIDTH') as number;
  const layout = getLayoutMetrics(canvas, input);
  const logoHeight = scaled(LOGO_HEIGHT, layout.fontScale);
  const logoMaxWidth = scaled(LOGO_MAX_WIDTH, layout.fontScale);
  const logoWidth = SHOW_LOGO ? drawLogo(context, getLogo(photo, LOGO_DARK_MODE), layout.left, safeY(canvas, layout.footerY - scaled(44, layout.fontScale), logoHeight / 2), logoHeight, logoMaxWidth, 'left') : 0;
  const logoGap = logoWidth ? scaled(44, layout.fontScale) : 0;
  const leftTextX = layout.left + logoWidth + logoGap;
  const textMax = layout.availableWidth - logoWidth - logoGap;

  drawFittedText(context, compactCameraName(photo), leftTextX, safeY(canvas, layout.footerY - scaled(44, layout.fontScale)), textMax, 'left', input, scaled(FONT_SIZE, layout.fontScale), 400);
  drawFittedText(context, metadataLine(photo, store, DIVIDER), leftTextX, safeY(canvas, layout.footerY + scaled(34, layout.fontScale)), textMax, 'left', input, scaled(FONT_SIZE, layout.fontScale, 0.55), 300);
  drawFittedText(context, LABEL || photo.takenAt, canvas.width - layout.right, safeY(canvas, layout.footerY + scaled(110, layout.fontScale)), layout.availableWidth, 'right', input, scaled(FONT_SIZE, layout.fontScale, 0.42), 300);

  context.restore();
  return canvas;
};

const SOCIAL_REEL_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const canvas = drawBaseCanvas(photo, input, store);
  const context = prepareText(canvas, input);
  const FONT_SIZE = input.get('FONT_SIZE') as number;
  const LABEL = (input.get('LABEL') as string).trim();
  const DIVIDER = (input.get('DIVIDER') as string).trim();
  const SHOW_LOGO = input.get('SHOW_LOGO') as boolean;
  const LOGO_DARK_MODE = input.get('LOGO_DARK_MODE') as boolean;
  const LOGO_HEIGHT = input.get('LOGO_HEIGHT') as number;
  const LOGO_MAX_WIDTH = input.get('LOGO_MAX_WIDTH') as number;
  const layout = getLayoutMetrics(canvas, input);

  if (SHOW_LOGO) {
    drawLogo(context, getLogo(photo, LOGO_DARK_MODE), layout.centerX, safeY(canvas, layout.footerY - scaled(76, layout.fontScale), scaled(LOGO_HEIGHT, layout.fontScale) / 2), scaled(LOGO_HEIGHT, layout.fontScale), scaled(LOGO_MAX_WIDTH, layout.fontScale), 'center');
  }

  drawFittedText(context, LABEL || compactCameraName(photo), layout.centerX, safeY(canvas, layout.footerY + scaled(4, layout.fontScale)), layout.availableWidth, 'center', input, scaled(FONT_SIZE, layout.fontScale), 300);
  drawFittedText(context, exposureLine(photo, store, DIVIDER), layout.centerX, safeY(canvas, layout.footerY + scaled(72, layout.fontScale)), layout.availableWidth, 'center', input, scaled(FONT_SIZE, layout.fontScale, 0.62), 300);

  context.restore();
  return canvas;
};

const SOCIAL_EDITORIAL_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const canvas = drawBaseCanvas(photo, input, store);
  const context = prepareText(canvas, input);
  const FONT_SIZE = input.get('FONT_SIZE') as number;
  const LABEL = (input.get('LABEL') as string).trim();
  const DIVIDER = (input.get('DIVIDER') as string).trim();
  const SHOW_LOGO = input.get('SHOW_LOGO') as boolean;
  const LOGO_DARK_MODE = input.get('LOGO_DARK_MODE') as boolean;
  const LOGO_HEIGHT = input.get('LOGO_HEIGHT') as number;
  const LOGO_MAX_WIDTH = input.get('LOGO_MAX_WIDTH') as number;
  const layout = getLayoutMetrics(canvas, input);

  if (SHOW_LOGO) {
    drawLogo(context, getLogo(photo, LOGO_DARK_MODE), layout.left, safeY(canvas, layout.headerY, scaled(LOGO_HEIGHT, layout.fontScale) / 2), scaled(LOGO_HEIGHT, layout.fontScale), scaled(LOGO_MAX_WIDTH, layout.fontScale), 'left');
  }

  drawFittedText(context, LABEL, canvas.width - layout.right, safeY(canvas, layout.headerY), layout.availableWidth * 0.58, 'right', input, scaled(FONT_SIZE, layout.fontScale, 0.58), 300);
  drawFittedText(context, compactCameraName(photo), layout.left, safeY(canvas, layout.footerY - scaled(42, layout.fontScale)), layout.availableWidth, 'left', input, scaled(FONT_SIZE, layout.fontScale), 400);
  drawFittedText(context, metadataLine(photo, store, DIVIDER), layout.left, safeY(canvas, layout.footerY + scaled(42, layout.fontScale)), layout.availableWidth, 'left', input, scaled(FONT_SIZE, layout.fontScale, 0.56), 300);
  drawFittedText(context, photo.takenAt, canvas.width - layout.right, safeY(canvas, layout.footerY + scaled(42, layout.fontScale)), layout.availableWidth * 0.45, 'right', input, scaled(FONT_SIZE, layout.fontScale, 0.48), 300);

  context.restore();
  return canvas;
};

export { SOCIAL_GALLERY_FUNC, SOCIAL_GALLERY_OPTIONS, SOCIAL_REEL_FUNC, SOCIAL_REEL_OPTIONS, SOCIAL_EDITORIAL_FUNC, SOCIAL_EDITORIAL_OPTIONS };
