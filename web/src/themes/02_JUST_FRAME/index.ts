import Photo from '../../core/photo';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import { ASPECT_RATIO_OPTIONS } from '../../constants/aspect-ratios';

const JUST_FRAME_OPTIONS: ThemeOption[] = [
  {
    id: 'ASPECT_RATIO',
    type: 'select',
    options: ASPECT_RATIO_OPTIONS,
    default: 'free',
    description: 'theme.option.aspect-ratio',
  },
  { id: 'BACKGROUND_COLOR', type: 'color', default: '#ffffff', description: '#ffffff is white, #000000 is black' },
  { id: 'BLUR_BACKGROUND', type: 'boolean', default: false, description: 'Use blurred photo as background', category: 'effects' },
  { id: 'BLUR_AMOUNT', type: 'range-slider', default: 20, min: 0, max: 100, step: 1, description: 'Blur intensity (0-100)', category: 'effects' },
  { id: 'PADDING_TOP', type: 'number', default: 100, description: 'px' },
  { id: 'PADDING_BOTTOM', type: 'number', default: 100, description: 'px' },
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

const JUST_FRAME_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store) => {
  const ASPECT_RATIO = (input.get('ASPECT_RATIO') as string).trim();
  const BACKGROUND_COLOR = (input.get('BACKGROUND_COLOR') as string).trim();
  const BLUR_BACKGROUND = input.get('BLUR_BACKGROUND') as boolean;
  const BLUR_AMOUNT = input.get('BLUR_AMOUNT') as number;
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
    padding: { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
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
};

export { JUST_FRAME_FUNC, JUST_FRAME_OPTIONS };
