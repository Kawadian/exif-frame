import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import overrideExifMetadata from '../../core/exif-metadata/override-exif-metadata';
import { getCameraMakerLogo } from '../maker-logo';
import Font from '../../fonts';

const THREE_LINE_OPTIONS: ThemeOption[] = [
  // Background & Padding
  { id: 'BACKGROUND_COLOR', type: 'color', default: '#ffffff', description: '#ffffff is white, #000000 is black' },
  { id: 'PADDING_INSIDE', type: 'boolean', default: false, description: 'enable to use inside padding' },
  { id: 'PADDING_TOP', type: 'number', default: 100, description: 'px' },
  { id: 'PADDING_BOTTOM', type: 'number', default: 500, description: 'px' },
  { id: 'PADDING_LEFT', type: 'number', default: 100, description: 'px' },
  { id: 'PADDING_RIGHT', type: 'number', default: 100, description: 'px' },
  // Text Style
  { id: 'TEXT_COLOR', type: 'color', default: '#000000', description: '#ffffff is white, #000000 is black' },
  { id: 'TEXT_ALPHA', type: 'range-slider', default: 1, min: 0, max: 1, step: 0.01, description: '0 - 1' },
  { id: 'TEXT_ALIGN', type: 'select', options: ['center', 'right', 'left'], default: 'center', description: 'left or center or right' },
  { id: 'FONT_STYLE', type: 'select', options: ['normal', 'italic'], default: 'normal', description: 'normal or italic' },
  { id: 'FONT_WEIGHT', type: 'range-slider', min: 100, max: 900, step: 100, default: 500, description: '100 - 900' },
  { id: 'FONT_SIZE', type: 'number', default: 70, description: 'px' },
  { id: 'FONT_FAMILY', type: 'select', options: ['Barlow', ...Object.values(Font)], default: 'Barlow', description: 'ex. din-alternate-bold, digital-7, Barlow, Arial, sans-serif' },
  // Top Label
  { id: 'TOP_LABEL', type: 'string', default: '', description: 'ex. @username' },
  // Logo Settings
  { id: 'SHOW_LOGO', type: 'boolean', default: true, description: 'show camera maker logo' },
  { id: 'LOGO_HEIGHT', type: 'number', default: 140, description: 'px' },
  { id: 'LOGO_MAX_WIDTH', type: 'number', default: 560, description: 'px (max width for logo)' },
  { id: 'LOGO_ALPHA', type: 'range-slider', default: 1, min: 0, max: 1, step: 0.01, description: '0 - 1' },
  // Line Settings
  { id: 'LINE_GAP', type: 'number', default: 0, description: 'px (gap between lines, 0 = auto)' },
  { id: 'DIVIDER', type: 'string', default: ' ', description: 'ex. | or ∙' },
  { id: 'TEMPLATE1', type: 'string', default: '{BODY}' },
  { id: 'TEMPLATE2', type: 'string', default: '{ISO}{MM}{F}{SEC}' },
];

const THREE_LINE_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  // Background & Padding
  const BACKGROUND_COLOR = (input.get('BACKGROUND_COLOR') as string).trim();
  const PADDING_INSIDE = input.get('PADDING_INSIDE') as boolean;
  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = input.get('PADDING_BOTTOM') as number;
  const PADDING_LEFT = input.get('PADDING_LEFT') as number;
  const PADDING_RIGHT = input.get('PADDING_RIGHT') as number;
  // Text Style
  const TEXT_COLOR = (input.get('TEXT_COLOR') as string).trim();
  const TEXT_ALPHA = input.get('TEXT_ALPHA') as number;
  const TEXT_ALIGN = (input.get('TEXT_ALIGN') as string).trim() as CanvasTextAlign;
  const FONT_STYLE = (input.get('FONT_STYLE') as string).trim();
  const FONT_WEIGHT = input.get('FONT_WEIGHT') as number;
  const FONT_SIZE = input.get('FONT_SIZE') as number;
  const FONT_FAMILY = (input.get('FONT_FAMILY') as string).trim();
  // Top Label
  const TOP_LABEL = (input.get('TOP_LABEL') as string).trim();
  // Logo Settings
  const SHOW_LOGO = input.get('SHOW_LOGO') as boolean;
  const LOGO_HEIGHT = input.get('LOGO_HEIGHT') as number;
  const LOGO_MAX_WIDTH = input.get('LOGO_MAX_WIDTH') as number;
  const LOGO_ALPHA = input.get('LOGO_ALPHA') as number;
  // Line Settings
  const LINE_GAP = input.get('LINE_GAP') as number;
  const DIVIDER = (input.get('DIVIDER') as string).trim();
  const TEMPLATE1 = (input.get('TEMPLATE1') as string).trim();
  const TEMPLATE2 = (input.get('TEMPLATE2') as string).trim();

  const canvas = sandbox(photo, {
    targetRatio: store.ratio,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: BACKGROUND_COLOR,
    padding: PADDING_INSIDE ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
  });

  const context = canvas.getContext('2d')!;
  context.textBaseline = 'middle';
  context.font = `${FONT_STYLE} ${FONT_WEIGHT} ${FONT_SIZE}px ${FONT_FAMILY}`;
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

  // Top Label
  if (TOP_LABEL) {
    context.textAlign = 'center';
    context.fillText(TOP_LABEL, canvas.width / 2, PADDING_TOP / 2);
  }

  // Logo
  const makeForLogo = overrideExifMetadata()?.make || photo.metadata.make;
  const modelForLogo = overrideExifMetadata()?.model || photo.metadata.model;
  // Use dark mode logo as base (white logo) for tinting
  const logo = SHOW_LOGO ? getCameraMakerLogo({ darkMode: true, make: makeForLogo, model: modelForLogo }) : null;

  if (logo) {
    const maxWidth = Math.min(LOGO_MAX_WIDTH, canvas.width - PADDING_LEFT - PADDING_RIGHT);

    let drawHeight = LOGO_HEIGHT;
    let drawWidth = (logo.width / logo.height) * drawHeight;

    if (drawWidth > maxWidth) {
      drawWidth = maxWidth;
      drawHeight = (logo.height / logo.width) * drawWidth;
    }

    // Calculate logo X position based on text alignment
    let logoX: number;
    if (TEXT_ALIGN === 'left') {
      logoX = PADDING_LEFT;
    } else if (TEXT_ALIGN === 'right') {
      logoX = canvas.width - PADDING_RIGHT - drawWidth;
    } else {
      logoX = (canvas.width - drawWidth) / 2;
    }

    // Create a temporary canvas to tint the logo with TEXT_COLOR
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = drawWidth;
    logoCanvas.height = drawHeight;
    const logoCtx = logoCanvas.getContext('2d')!;

    // Draw the logo
    logoCtx.drawImage(logo, 0, 0, drawWidth, drawHeight);

    // Apply color tint using multiply blend mode
    logoCtx.globalCompositeOperation = 'source-in';
    logoCtx.fillStyle = TEXT_COLOR;
    logoCtx.fillRect(0, 0, drawWidth, drawHeight);

    context.globalAlpha = LOGO_ALPHA;
    context.drawImage(logoCanvas, logoX, centerY - gapY - drawHeight / 2, drawWidth, drawHeight);
    context.globalAlpha = TEXT_ALPHA;
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
