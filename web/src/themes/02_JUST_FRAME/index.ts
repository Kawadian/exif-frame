import Photo from '../../core/photo';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';

const JUST_FRAME_OPTIONS: ThemeOption[] = [
  { 
    id: 'ASPECT_RATIO', 
    type: 'select', 
    options: ['free', '1:1', '4:5', '9:16', '2:3', '3:4', '5:4', '3:2', '4:3', '16:9', '16:10', '21:9', '2.39:1'],
    default: 'free', 
    description: 'Aspect ratio for the output image' 
  },
  { id: 'BACKGROUND_COLOR', type: 'color', default: '#ffffff', description: '#ffffff is white, #000000 is black' },
  { id: 'PADDING_TOP', type: 'number', default: 100, description: 'px' },
  { id: 'PADDING_BOTTOM', type: 'number', default: 100, description: 'px' },
  { id: 'PADDING_LEFT', type: 'number', default: 100, description: 'px' },
  { id: 'PADDING_RIGHT', type: 'number', default: 100, description: 'px' },
];

const JUST_FRAME_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store) => {
  const ASPECT_RATIO = (input.get('ASPECT_RATIO') as string).trim();
  const BACKGROUND_COLOR = (input.get('BACKGROUND_COLOR') as string).trim();
  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = input.get('PADDING_BOTTOM') as number;
  const PADDING_LEFT = input.get('PADDING_LEFT') as number;
  const PADDING_RIGHT = input.get('PADDING_RIGHT') as number;

  return sandbox(photo, {
    targetRatio: ASPECT_RATIO === 'free' ? store.ratio : ASPECT_RATIO,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: BACKGROUND_COLOR,
    padding: { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT },
  });
};

export { JUST_FRAME_FUNC, JUST_FRAME_OPTIONS };
