import { ThemeOption } from '../pages/theme/types/theme-option';

export type CustomizeCategory = 'frame' | 'photo' | 'text';

export const CUSTOMIZE_CATEGORIES: CustomizeCategory[] = ['frame', 'photo', 'text'];

const PHOTO_OPTION_IDS = new Set([
  'PHOTO_BORDER_WIDTH',
  'PHOTO_BORDER_COLOR',
  'SHOW_SHADOW',
  'SHADOW_OFFSET_X',
  'SHADOW_OFFSET_Y',
  'SHADOW_BLUR',
  'SHADOW_COLOR',
  'SHADOW_OPACITY',
  'SHADOW_SIZE',
]);

const FRAME_OPTION_IDS = new Set([
  'ASPECT_RATIO',
  'BACKGROUND_COLOR',
  'BLUR_BACKGROUND',
  'BLUR_AMOUNT',
  'PADDING_INSIDE',
  'PADDING_TOP',
  'PADDING_BOTTOM',
  'PADDING_LEFT',
  'PADDING_RIGHT',
  'DARK_MODE',
]);

const isTextOptionId = (id: string) => {
  if (PHOTO_OPTION_IDS.has(id) || FRAME_OPTION_IDS.has(id)) {
    return false;
  }

  return (
    id.includes('TEXT') ||
    id.startsWith('FONT_') ||
    id.startsWith('TEMPLATE') ||
    id.startsWith('LOGO') ||
    id === 'SHOW_LOGO' ||
    id === 'TOP_LABEL' ||
    id === 'DIVIDER' ||
    id === 'LINE_GAP' ||
    id === 'LETTER_SPACING' ||
    id === 'ARTIST' ||
    id === 'LABEL' ||
    id === 'COMPACT' ||
    id === 'HIDE_TEXT' ||
    id === 'TAG' ||
    id === 'TITLE' ||
    id.startsWith('DESCRIPTION') ||
    id.endsWith('_SIZE') ||
    id.endsWith('_WEIGHT')
  );
};

/**
 * Resolve which customize tab an option belongs to.
 * Explicit option.category wins when it is frame/photo/text.
 * Legacy "effects" maps to photo for shadow-like options and frame otherwise.
 */
export const getCustomizeCategory = (option: ThemeOption): CustomizeCategory => {
  if (option.category === 'frame' || option.category === 'photo' || option.category === 'text') {
    return option.category;
  }

  if (PHOTO_OPTION_IDS.has(option.id)) {
    return 'photo';
  }

  if (FRAME_OPTION_IDS.has(option.id)) {
    return 'frame';
  }

  if (isTextOptionId(option.id)) {
    return 'text';
  }

  if (option.category === 'effects') {
    return option.id.includes('SHADOW') ? 'photo' : 'frame';
  }

  // Unknown options default to frame (layout / canvas).
  return 'frame';
};

export const filterOptionsByCategory = (options: ThemeOption[] | undefined, category: CustomizeCategory): ThemeOption[] => {
  if (!options) {
    return [];
  }
  return options.filter((option) => getCustomizeCategory(option) === category);
};

export const getAvailableCustomizeCategories = (options: ThemeOption[] | undefined): CustomizeCategory[] => {
  if (!options || options.length === 0) {
    return [];
  }

  const present = new Set(options.map(getCustomizeCategory));
  return CUSTOMIZE_CATEGORIES.filter((category) => present.has(category));
};
