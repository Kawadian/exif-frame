import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import overrideExifMetadata from '../../core/exif-metadata/override-exif-metadata';
import { getCameraMakerLogo } from '../maker-logo';
import * as CommonOptions from '../common-options';

const ONE_LINE_OPTIONS: ThemeOption[] = [
  CommonOptions.createAspectRatioOption(),
  CommonOptions.createBackgroundColorOption('#ffffff'),
  CommonOptions.createBlurBackgroundOption(),
  CommonOptions.createBlurAmountOption(),
  CommonOptions.createPaddingInsideOption(false),
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
  CommonOptions.createTextColorOption('#000000'),
  CommonOptions.createTextAlphaOption(1),
  CommonOptions.createTextAlignOption('center'),
  CommonOptions.createFontStyleOption('normal'),
  CommonOptions.createFontWeightOption(300),
  CommonOptions.createFontSizeOption(70),
  CommonOptions.createFontFamilyOption('Barlow'),
  CommonOptions.createTopLabelOption(''),
  CommonOptions.createDividerOption('∙'),
  { id: 'TEMPLATE', type: 'string', default: '{MAKER}{BODY}{LENS}{ISO}{MM}{F}{SEC}', description: 'theme.option.template1' },
  CommonOptions.createLogoDarkModeOption(true),
  CommonOptions.createLogoHeightOption(50),
  CommonOptions.createLogoMaxWidthOption(200),
];

const ONE_LINE_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
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
  const TEXT_COLOR = input.get('TEXT_COLOR') as string;
  const TEXT_ALPHA = input.get('TEXT_ALPHA') as number;
  const TEXT_ALIGN = (input.get('TEXT_ALIGN') as string).trim() as CanvasTextAlign;
  const FONT_STYLE = (input.get('FONT_STYLE') as string).trim();
  const FONT_WEIGHT = input.get('FONT_WEIGHT') as number;
  const FONT_SIZE = input.get('FONT_SIZE') as number;
  const FONT_FAMILY = (input.get('FONT_FAMILY') as string).trim();
  const TOP_LABEL = (input.get('TOP_LABEL') as string).trim();
  const DIVIDER = (input.get('DIVIDER') as string).trim();
  const TEMPLATE = (input.get('TEMPLATE') as string).trim();
  // Logo Settings
  const LOGO_DARK_MODE = input.get('LOGO_DARK_MODE') as boolean;
  const LOGO_HEIGHT = input.get('LOGO_HEIGHT') as number;
  const LOGO_MAX_WIDTH = input.get('LOGO_MAX_WIDTH') as number;

  const canvas = sandbox(photo, {
    targetRatio: ASPECT_RATIO === 'free' ? store.ratio : ASPECT_RATIO,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: BACKGROUND_COLOR,
    padding: PADDING_INSIDE ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
    blurBackground: BLUR_BACKGROUND ? { amount: BLUR_AMOUNT } : undefined,
    photoBorder: PHOTO_BORDER_WIDTH > 0 ? { width: PHOTO_BORDER_WIDTH, color: PHOTO_BORDER_COLOR } : undefined,
    shadow: SHADOW_BLUR > 0 ? { offsetX: SHADOW_OFFSET_X, offsetY: SHADOW_OFFSET_Y, blur: SHADOW_BLUR, color: SHADOW_COLOR, opacity: SHADOW_OPACITY } : undefined,
  });

  const context = canvas.getContext('2d')!;
  const actualFontFamily = FONT_FAMILY === 'Default' ? 'sans-serif' : FONT_FAMILY;
  context.fillStyle = TEXT_COLOR;
  context.textBaseline = 'middle';
  context.font = `${FONT_STYLE} ${FONT_WEIGHT} ${FONT_SIZE}px ${actualFontFamily}`;
  context.textAlign = 'center';
  context.globalAlpha = TEXT_ALPHA;
  context.fillText(TOP_LABEL, canvas.width / 2, PADDING_TOP / 2);

  context.textAlign = TEXT_ALIGN as CanvasTextAlign;

  // Check if TEMPLATE contains {LOGO}
  const hasLogo = TEMPLATE.includes('{LOGO}');
  let logo: HTMLImageElement | undefined;
  if (hasLogo) {
    const makeForLogo = overrideExifMetadata()?.make || photo.metadata.make;
    const modelForLogo = overrideExifMetadata()?.model || photo.metadata.model;
    logo = getCameraMakerLogo({ darkMode: LOGO_DARK_MODE, make: makeForLogo, model: modelForLogo });
  }

  const text = TEMPLATE.split('}')
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
        .replace(/{LOGO}/g, '') // Remove {LOGO} placeholder from text
        .replace(/}/g, '')
    )
    .filter(Boolean)
    .join(' ' + DIVIDER + ' ');

  const textY = canvas.height - PADDING_BOTTOM / 2;
  let textX = TEXT_ALIGN === 'left' ? PADDING_LEFT : TEXT_ALIGN === 'center' ? canvas.width / 2 : canvas.width - PADDING_RIGHT;

  // Draw logo if present
  if (logo && hasLogo) {
    const maxWidth = Math.min(LOGO_MAX_WIDTH, canvas.width - PADDING_LEFT - PADDING_RIGHT);
    let drawHeight = LOGO_HEIGHT;
    let drawWidth = (logo.width / logo.height) * drawHeight;

    if (drawWidth > maxWidth) {
      drawWidth = maxWidth;
      drawHeight = (logo.height / logo.width) * drawWidth;
    }

    const textWidth = context.measureText(text).width;
    const totalWidth = textWidth + (text ? drawWidth + 20 : drawWidth); // 20px spacing

    let logoX: number;
    if (TEXT_ALIGN === 'left') {
      logoX = PADDING_LEFT;
      textX = logoX + drawWidth + (text ? 20 : 0);
    } else if (TEXT_ALIGN === 'right') {
      textX = canvas.width - PADDING_RIGHT - drawWidth - (text ? 20 : 0) - textWidth;
      logoX = canvas.width - PADDING_RIGHT - drawWidth;
      textX = TEXT_ALIGN === 'right' ? canvas.width - PADDING_RIGHT - drawWidth - (text ? 20 : 0) : textX;
    } else { // center
      logoX = (canvas.width - totalWidth) / 2;
      textX = logoX + drawWidth + (text ? 20 : 0);
      context.textAlign = 'left';
    }

    context.drawImage(logo, logoX, textY - drawHeight / 2, drawWidth, drawHeight);
  }

  if (text) {
    context.fillText(text, textX, textY);
  }
  context.globalAlpha = 1;

  return canvas;
};

export { ONE_LINE_FUNC, ONE_LINE_OPTIONS };
