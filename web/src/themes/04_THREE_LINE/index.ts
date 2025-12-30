import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import overrideExifMetadata from '../../core/exif-metadata/override-exif-metadata';
import { getCameraMakerLogo } from '../maker-logo';

const THREE_LINE_OPTIONS: ThemeOption[] = [
  { id: 'DARK_MODE', type: 'boolean', default: false, description: 'enable to use dark mode' },
  { id: 'LOGO_HEIGHT', type: 'number', default: 140, description: 'px' },
  { id: 'FONT_SIZE', type: 'number', default: 70, description: 'px' },
  { id: 'PADDING_TOP', type: 'number', default: 0, description: 'px' },
  { id: 'PADDING_BOTTOM', type: 'number', default: 500, description: 'px' },
  { id: 'PADDING_LEFT', type: 'number', default: 0, description: 'px' },
  { id: 'PADDING_RIGHT', type: 'number', default: 0, description: 'px' },
];

const THREE_LINE_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const DARK_MODE = input.get('DARK_MODE') as boolean;
  const LOGO_HEIGHT = input.get('LOGO_HEIGHT') as number;
  const FONT_SIZE = input.get('FONT_SIZE') as number;

  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = input.get('PADDING_BOTTOM') as number;
  const PADDING_LEFT = input.get('PADDING_LEFT') as number;
  const PADDING_RIGHT = input.get('PADDING_RIGHT') as number;

  const BACKGROUND_COLOR = DARK_MODE ? '#000000' : '#ffffff';
  const TEXT_COLOR = DARK_MODE ? '#ffffff' : '#000000';

  const canvas = sandbox(photo, {
    targetRatio: store.ratio,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: BACKGROUND_COLOR,
    padding: { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
  });

  const context = canvas.getContext('2d')!;
  context.textBaseline = 'middle';
  context.textAlign = 'center';

  const centerX = canvas.width / 2;
  const centerY = canvas.height - PADDING_BOTTOM / 2;
  const gapY = FONT_SIZE * 1.15;

  const makeForLogo = overrideExifMetadata()?.make || photo.metadata.make;
  const modelForLogo = overrideExifMetadata()?.model || photo.metadata.model;
  const logo = getCameraMakerLogo({ darkMode: DARK_MODE, make: makeForLogo, model: modelForLogo });

  if (logo) {
    const maxWidth = Math.min(FONT_SIZE * 8, canvas.width - FONT_SIZE * 2);

    let drawHeight = LOGO_HEIGHT;
    let drawWidth = (logo.width / logo.height) * drawHeight;

    if (drawWidth > maxWidth) {
      drawWidth = maxWidth;
      drawHeight = (logo.height / logo.width) * drawWidth;
    }

    context.drawImage(logo, centerX - drawWidth / 2, centerY - gapY - drawHeight / 2, drawWidth, drawHeight);
  }

  const bodyText = photo.model || '';
  if (bodyText) {
    context.font = `normal 500 ${FONT_SIZE}px Barlow`;
    context.fillStyle = TEXT_COLOR;
    context.fillText(bodyText, centerX, centerY);
  }

  if (!store.disableExposureMeter) {
    const exposureText = [photo.iso, photo.focalLength, photo.fNumber, photo.exposureTime].filter(Boolean).join(' ');
    if (exposureText) {
      context.font = `normal 500 ${FONT_SIZE}px Barlow`;
      context.fillStyle = TEXT_COLOR;
      context.fillText(exposureText, centerX, centerY + gapY);
    }
  }

  return canvas;
};

export { THREE_LINE_FUNC, THREE_LINE_OPTIONS };
