import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import Font from '../../fonts';
import { ASPECT_RATIO_OPTIONS } from '../../constants/aspect-ratios';

const SIMPLE_OPTIONS: ThemeOption[] = [
  { 
    id: 'ASPECT_RATIO', 
    type: 'select', 
    options: ASPECT_RATIO_OPTIONS,
    default: 'free', 
    description: 'Aspect ratio for the output image' 
  },
  { id: 'LABEL', type: 'string', default: '@username', description: 'ex. @username' },
  { id: 'FONT_FAMILY', type: 'select', options: ['Default', 'Barlow', ...Object.values(Font)], default: 'Barlow', description: 'ex. din-alternate-bold, digital-7, Barlow, Arial, sans-serif' },
  { id: 'BLUR_BACKGROUND', type: 'boolean', default: false, description: 'Use blurred photo as background', category: 'effects' },
  { id: 'BLUR_AMOUNT', type: 'range-slider', default: 20, min: 0, max: 100, step: 1, description: 'Blur intensity (0-100)', category: 'effects' },
  { id: 'PADDING_INSIDE', type: 'boolean', default: false, description: 'enable to use inside padding' },
  { id: 'PADDING_TOP', type: 'number', default: 100, description: 'px' },
  { id: 'PADDING_BOTTOM', type: 'number', default: 400, description: 'px' },
  { id: 'PADDING_LEFT', type: 'number', default: 100, description: 'px' },
  { id: 'PADDING_RIGHT', type: 'number', default: 100, description: 'px' },
  { id: 'PHOTO_BORDER_WIDTH', type: 'number', default: 0, description: 'px' },
  { id: 'PHOTO_BORDER_COLOR', type: 'color', default: '#000000', description: '#ffffff is white, #000000 is black' },
  { id: 'SHADOW_OFFSET_X', type: 'number', default: 0, description: 'px, positive = right, negative = left' },
  { id: 'SHADOW_OFFSET_Y', type: 'number', default: 0, description: 'px, positive = down, negative = up' },
  { id: 'SHADOW_BLUR', type: 'number', default: 0, description: 'px, 0 = no shadow' },
  { id: 'SHADOW_COLOR', type: 'color', default: '#000000', description: 'shadow color' },
  { id: 'SHADOW_OPACITY', type: 'range-slider', default: 0.5, min: 0, max: 1, step: 0.01, description: '0 - 1' },
];

const SIMPLE_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const ASPECT_RATIO = (input.get('ASPECT_RATIO') as string).trim();
  const LABEL = (input.get('LABEL') as string).trim();
  const FONT_FAMILY = (input.get('FONT_FAMILY') as string).trim();
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

  const canvas = sandbox(photo, {
    targetRatio: ASPECT_RATIO === 'free' ? store.ratio : ASPECT_RATIO,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: '#ffffff',
    padding: PADDING_INSIDE ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
    photoBorder: PHOTO_BORDER_WIDTH > 0 ? { width: PHOTO_BORDER_WIDTH, color: PHOTO_BORDER_COLOR } : undefined,
    shadow: SHADOW_BLUR > 0 ? { 
      offsetX: SHADOW_OFFSET_X, 
      offsetY: SHADOW_OFFSET_Y, 
      blur: SHADOW_BLUR, 
      color: SHADOW_COLOR, 
      opacity: SHADOW_OPACITY 
    } : undefined,
    blurBackground: BLUR_BACKGROUND ? { amount: BLUR_AMOUNT } : undefined,
  });

  const context = canvas.getContext('2d')!;
  const actualFontFamily = FONT_FAMILY === 'Default' ? 'sans-serif' : FONT_FAMILY;
  context.fillStyle = '#a0a0a0';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  context.font = `300 ${40}px ${actualFontFamily}`;
  context.fillText(LABEL, canvas.width / 2, canvas.height - 60);

  context.textAlign = 'left';
  context.fillStyle = '#000000';
  context.font = `700 ${100}px ${actualFontFamily}`;
  const makerWidth = context.measureText(photo.make + ' ').width;
  context.font = `300 ${100}px ${actualFontFamily}`;
  const modelWidth = context.measureText(photo.model).width;
  context.font = `700 ${100}px ${actualFontFamily}`;
  context.fillText(photo.make, canvas.width / 2 - (makerWidth + modelWidth) / 2, canvas.height - PADDING_BOTTOM / 2 - 100);
  context.font = `300 ${100}px ${actualFontFamily}`;
  context.fillText(photo.model, canvas.width / 2 - (makerWidth + modelWidth) / 2 + makerWidth, canvas.height - PADDING_BOTTOM / 2 - 100);

  context.textAlign = 'center';
  context.fillStyle = '#a0a0a0';

  context.font = `300 ${30}px ${actualFontFamily}`;
  context.fillText(photo.takenAt, canvas.width / 2, canvas.height - PADDING_BOTTOM / 2 + 80);

  if (!store.disableExposureMeter) {
    context.font = `300 ${50}px ${actualFontFamily}`;
    context.fillText([`${photo.iso}`, `${photo.focalLength}`, `${photo.fNumber}`, `${photo.exposureTime}`].filter(Boolean).join(' ∙ '), canvas.width / 2, canvas.height - PADDING_BOTTOM / 2);
  }

  return canvas;
};

export { SIMPLE_FUNC, SIMPLE_OPTIONS };
