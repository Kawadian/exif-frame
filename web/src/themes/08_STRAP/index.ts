import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import overrideExifMetadata from '../../core/exif-metadata/override-exif-metadata';
import { getCameraMakerLogo } from '../maker-logo';

const STRAP_OPTIONS: ThemeOption[] = [
  { id: 'ARTIST', type: 'string', default: '', description: 'your name' },
  { id: 'DARK_MODE', type: 'boolean', default: false, description: 'enable to use dark mode' },
  { id: 'BLUR_BACKGROUND', type: 'boolean', default: false, description: 'Use blurred photo as background', category: 'effects' },
  { id: 'BLUR_AMOUNT', type: 'range-slider', default: 20, min: 0, max: 100, step: 1, description: 'Blur intensity (0-100)', category: 'effects' },
  { id: 'SECONDARY_TEXT_FONT_WEIGHT', type: 'range-slider', min: 100, max: 900, step: 100, default: 300, description: '100 - 900' },
  { id: 'PADDING_TOP', type: 'number', default: 0, description: 'px' },
  { id: 'PADDING_BOTTOM', type: 'number', default: 0, description: 'px' },
  { id: 'PADDING_LEFT', type: 'number', default: 0, description: 'px' },
  { id: 'PADDING_RIGHT', type: 'number', default: 0, description: 'px' },
  { id: 'TEMPLATE1', type: 'string', default: '{ISO}{MM}{F}{SEC}' },
  { id: 'TEMPLATE2', type: 'string', default: '{MAKER}{BODY}' },
  { id: 'TEMPLATE3', type: 'string', default: '{TAKEN_AT}' },
  { id: 'TEMPLATE4', type: 'string', default: '{LENS}' },
];

const STRAP_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const ARTIST = (input.get('ARTIST') as string).trim();
  const DARK_MODE = input.get('DARK_MODE') as boolean;
  const BLUR_BACKGROUND = input.get('BLUR_BACKGROUND') as boolean;
  const BLUR_AMOUNT = input.get('BLUR_AMOUNT') as number;
  const SECONDARY_TEXT_FONT_WEIGHT = input.get('SECONDARY_TEXT_FONT_WEIGHT') as number;
  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = (input.get('PADDING_BOTTOM') as number) + 300;
  const PADDING_LEFT = input.get('PADDING_LEFT') as number;
  const PADDING_RIGHT = input.get('PADDING_RIGHT') as number;
  const TEMPLATE1 = (input.get('TEMPLATE1') as string).trim();
  const TEMPLATE2 = (input.get('TEMPLATE2') as string).trim();
  const TEMPLATE3 = (input.get('TEMPLATE3') as string).trim();
  const TEMPLATE4 = (input.get('TEMPLATE4') as string).trim();
  const FONT_SIZE = 70;
  const BACKGROUND_COLOR = DARK_MODE ? '#000000' : '#ffffff';
  const PRIMARY_TEXT_COLOR = DARK_MODE ? '#ffffff' : '#000000';
  const SECONDARY_TEXT_COLOR = DARK_MODE ? '#888888' : '#333333';

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
    .join(' ');

  const text2 = TEMPLATE2.split('}')
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
    .join(' ');

  const text3 = TEMPLATE3.split('}')
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
    .join(' ');

  const text4 = TEMPLATE4.split('}')
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
    .join(' ');

  const canvas = sandbox(photo, {
    targetRatio: store.ratio,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: BACKGROUND_COLOR,
    padding: { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
    blurBackground: BLUR_BACKGROUND ? { amount: BLUR_AMOUNT } : undefined,
  });
  const context = canvas.getContext('2d')!;
  context.textBaseline = 'middle';

  // LEFT FIRST
  context.textAlign = 'left';

  // ISO, Focal Length, F-Number, Exposure Time
  context.font = `normal 500 ${FONT_SIZE}px Barlow`;
  context.fillStyle = PRIMARY_TEXT_COLOR;

  if (!store.disableExposureMeter) {
    context.fillText(text1, FONT_SIZE, canvas.height - PADDING_BOTTOM / 2 - FONT_SIZE / 2);
  }

  // Shot by
  if (ARTIST) {
    context.font = `normal ${SECONDARY_TEXT_FONT_WEIGHT} ${FONT_SIZE}px Barlow`;
    context.fillStyle = SECONDARY_TEXT_COLOR;
    context.fillText(`Shot by © ${ARTIST}`, FONT_SIZE, canvas.height - PADDING_BOTTOM / 2 + FONT_SIZE / 2);
  } else {
    context.font = `normal ${SECONDARY_TEXT_FONT_WEIGHT} ${FONT_SIZE}px Barlow`;
    context.fillStyle = SECONDARY_TEXT_COLOR;
    context.fillText(text3, FONT_SIZE, canvas.height - PADDING_BOTTOM / 2 + FONT_SIZE / 2);
  }

  // RIGHT SECOND
  context.textAlign = 'right';

  // Maker, Model
  context.fillStyle = PRIMARY_TEXT_COLOR;
  context.font = `normal 500 ${FONT_SIZE}px Barlow`;
  const makerModelText = text2;
  const topWidth = context.measureText(makerModelText).width;
  context.fillText(makerModelText, canvas.width - FONT_SIZE, canvas.height - PADDING_BOTTOM / 2 - FONT_SIZE / 2);

  // Lens Model
  context.fillStyle = SECONDARY_TEXT_COLOR;
  context.font = `normal ${SECONDARY_TEXT_FONT_WEIGHT} ${FONT_SIZE}px Barlow`;
  const lensModelText = text4;
  const bottomWidth = context.measureText(lensModelText).width;
  context.fillText(lensModelText, canvas.width - FONT_SIZE, canvas.height - PADDING_BOTTOM / 2 + FONT_SIZE / 2);

  // DRAW LINE
  context.beginPath();
  context.moveTo(canvas.width - Math.max(topWidth, bottomWidth) - FONT_SIZE * 2, canvas.height - PADDING_BOTTOM / 2 - FONT_SIZE);
  context.lineTo(canvas.width - Math.max(topWidth, bottomWidth) - FONT_SIZE * 2, canvas.height - PADDING_BOTTOM / 2 + FONT_SIZE);
  context.strokeStyle = SECONDARY_TEXT_COLOR;
  context.lineWidth = 2;
  context.stroke();

  // DRAW ICON
  let TARGET_LOGO_HEIGHT = FONT_SIZE * 2;
  const TARGET_LOGO_WIDTH = 400;

  const maker = overrideExifMetadata()?.make || photo.metadata.make;
  const model = overrideExifMetadata()?.model || photo.metadata.model;
  const logo = getCameraMakerLogo({ darkMode: DARK_MODE, make: maker, model });

  if (logo) {
    let LOGO_WIDTH = (logo.width / logo.height) * TARGET_LOGO_HEIGHT;
    if (LOGO_WIDTH > TARGET_LOGO_WIDTH) {
      LOGO_WIDTH = TARGET_LOGO_WIDTH;
      TARGET_LOGO_HEIGHT = (logo.height / logo.width) * TARGET_LOGO_WIDTH;
    }
    context.drawImage(
      logo,
      canvas.width - Math.max(topWidth, bottomWidth) - FONT_SIZE * 2 - FONT_SIZE - LOGO_WIDTH,
      canvas.height - PADDING_BOTTOM / 2 - TARGET_LOGO_HEIGHT / 2,
      LOGO_WIDTH,
      TARGET_LOGO_HEIGHT
    );
  }

  return canvas;
};

export { STRAP_FUNC, STRAP_OPTIONS };
