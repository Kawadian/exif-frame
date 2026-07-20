import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import overrideExifMetadata from '../../core/exif-metadata/override-exif-metadata';
import { getCameraMakerLogo, getLogoDrawSize } from '../maker-logo';
import * as CommonOptions from '../common-options';

const THREE_LINE_OPTIONS: ThemeOption[] = [
  CommonOptions.createAspectRatioOption(),
  CommonOptions.createBackgroundColorOption('#ffffff'),
  CommonOptions.createBlurBackgroundOption(),
  CommonOptions.createBlurAmountOption(),
  CommonOptions.createPaddingInsideOption(false),
  CommonOptions.createPaddingTopOption(100),
  CommonOptions.createPaddingBottomOption(500),
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
  CommonOptions.createFontWeightOption(500),
  CommonOptions.createFontSizeOption(70),
  CommonOptions.createFontFamilyOption('Barlow'),
  CommonOptions.createTopLabelOption(''),
  CommonOptions.createShowLogoOption(true),
  CommonOptions.createLogoDarkModeOption(true),
  CommonOptions.createLogoHeightOption(140),
  CommonOptions.createLogoMaxWidthOption(400),
  CommonOptions.createLineGapOption(0),
  CommonOptions.createDividerOption(' '),
  CommonOptions.createTemplate1Option('{BODY}'),
  CommonOptions.createTemplate2Option('{ISO}{MM}{F}{SEC}'),
];

const THREE_LINE_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  // Background & Padding
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
  // Text Style
  const TEXT_COLOR = (input.get('TEXT_COLOR') as string).trim();
  const TEXT_ALPHA = input.get('TEXT_ALPHA') as number;
  const TEXT_ALIGN = (input.get('TEXT_ALIGN') as string).trim() as CanvasTextAlign;
  const FONT_STYLE = (input.get('FONT_STYLE') as string).trim();
  const FONT_WEIGHT = input.get('FONT_WEIGHT') as number;
  const FONT_SIZE = input.get('FONT_SIZE') as number;
  const FONT_FAMILY = (input.get('FONT_FAMILY') as string).trim();
  const actualFontFamily = FONT_FAMILY === 'Default' ? 'sans-serif' : FONT_FAMILY;
  // Top Label
  const TOP_LABEL = (input.get('TOP_LABEL') as string).trim();
  // Logo Settings
  const SHOW_LOGO = input.get('SHOW_LOGO') as boolean;
  const LOGO_DARK_MODE = input.get('LOGO_DARK_MODE') as boolean;
  const LOGO_HEIGHT = input.get('LOGO_HEIGHT') as number;
  const LOGO_MAX_WIDTH = input.get('LOGO_MAX_WIDTH') as number;
  // Line Settings
  const LINE_GAP = input.get('LINE_GAP') as number;
  const DIVIDER = (input.get('DIVIDER') as string).trim();
  const TEMPLATE1 = (input.get('TEMPLATE1') as string).trim();
  const TEMPLATE2 = (input.get('TEMPLATE2') as string).trim();

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
  context.textBaseline = 'middle';
  context.font = `${FONT_STYLE} ${FONT_WEIGHT} ${FONT_SIZE}px ${actualFontFamily}`;
  context.fillStyle = TEXT_COLOR;
  context.globalAlpha = TEXT_ALPHA;

  // Calculate text position based on alignment
  const getTextX = () => {
    if (TEXT_ALIGN === 'left') return PADDING_LEFT;
    if (TEXT_ALIGN === 'right') return canvas.width - PADDING_RIGHT;
    return canvas.width / 2;
  };
  const textX = getTextX();

  const centerY = canvas.height - PADDING_BOTTOM / 2;
  const gapY = LINE_GAP > 0 ? LINE_GAP : FONT_SIZE * 1.15;
  const logoBottomGap = FONT_SIZE * 0.5; // ロゴ下部の追加間隔

  // Top Label
  if (TOP_LABEL) {
    context.textAlign = 'center';
    context.fillText(TOP_LABEL, canvas.width / 2, PADDING_TOP / 2);
  }

  // Logo
  const makeForLogo = overrideExifMetadata()?.make || photo.metadata.make;
  const modelForLogo = overrideExifMetadata()?.model || photo.metadata.model;
  const logo = SHOW_LOGO ? getCameraMakerLogo({ darkMode: LOGO_DARK_MODE, make: makeForLogo, model: modelForLogo }) : null;

  if (logo) {
    const maxWidth = Math.min(LOGO_MAX_WIDTH, canvas.width - PADDING_LEFT - PADDING_RIGHT);
    const { width: drawWidth, height: drawHeight } = getLogoDrawSize(logo, LOGO_HEIGHT, maxWidth);

    // Calculate logo X position based on text alignment
    let logoX: number;
    if (TEXT_ALIGN === 'left') {
      logoX = PADDING_LEFT;
    } else if (TEXT_ALIGN === 'right') {
      logoX = canvas.width - PADDING_RIGHT - drawWidth;
    } else {
      logoX = (canvas.width - drawWidth) / 2;
    }

    context.drawImage(logo, logoX, centerY - gapY - logoBottomGap - drawHeight / 2, drawWidth, drawHeight);
  }

  // Line 1 (Body/Model text with template)
  context.textAlign = TEXT_ALIGN;
  const text1 = TEMPLATE1.split('}')
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
    .join(DIVIDER ? ` ${DIVIDER} ` : ' ');

  if (text1) {
    context.fillText(text1, textX, centerY);
  }

  // Line 2 (Exposure info with template)
  if (!store.disableExposureMeter) {
    const text2 = TEMPLATE2.split('}')
      .map((part) => `${part}}`)
      .map((part) =>
        part
          .replace(/{MAKER}/g, photo.make)
          .replace(/{BODY}/g, photo.model || '')
          .replace(/{LENS}/g, photo.lensModel || '')
          .replace(/{ISO}/g, photo.iso || '')
          .replace(/{MM}/g, photo.focalLength || '')
          .replace(/{F}/g, photo.fNumber || '')
          .replace(/{SEC}/g, photo.exposureTime || '')
          .replace(/{TAKEN_AT}/g, photo.takenAt || '')
          .replace(/{LOGO}/g, '') // Remove {LOGO} placeholder from text
          .replace(/}/g, '')
      )
      .filter(Boolean)
      .join(DIVIDER ? ` ${DIVIDER} ` : ' ');

    if (text2) {
      context.fillText(text2, textX, centerY + gapY);
    }
  }

  context.globalAlpha = 1;

  return canvas;
};

export { THREE_LINE_FUNC, THREE_LINE_OPTIONS };
