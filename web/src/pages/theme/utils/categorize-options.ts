import { ThemeOption } from '../types/theme-option';

type OptionCategory = 'frame' | 'text-style' | 'text-content' | 'effects';

interface CategorizedOptions {
  frame: ThemeOption[];
  'text-style': ThemeOption[];
  'text-content': ThemeOption[];
  effects: ThemeOption[];
}

const categorizeOption = (option: ThemeOption): OptionCategory => {
  // If category is explicitly set, use it
  if (option.category) {
    return option.category;
  }

  const id = option.id.toUpperCase();

  // Frame adjustments
  if (
    id.includes('ASPECT_RATIO') ||
    id.includes('BACKGROUND') ||
    id.includes('PADDING') ||
    id.includes('BORDER') ||
    id.includes('MARGIN')
  ) {
    return 'frame';
  }

  // Text style
  if (
    id.includes('FONT') ||
    id.includes('TEXT_COLOR') ||
    id.includes('TEXT_ALPHA') ||
    id.includes('TEXT_ALIGN')
  ) {
    return 'text-style';
  }

  // Text content
  if (
    id.includes('TEMPLATE') ||
    id.includes('DIVIDER') ||
    id.includes('LABEL') ||
    id === 'TEXT' ||
    id.endsWith('_TEXT')
  ) {
    return 'text-content';
  }

  // Effects (shadows, blur, etc.)
  if (
    id.includes('SHADOW') ||
    id.includes('BLUR') ||
    id.includes('OPACITY') ||
    id.includes('EFFECT')
  ) {
    return 'effects';
  }

  // Default to frame
  return 'frame';
};

export const categorizeOptions = (options: ThemeOption[]): CategorizedOptions => {
  const categorized: CategorizedOptions = {
    frame: [],
    'text-style': [],
    'text-content': [],
    effects: [],
  };

  options.forEach((option) => {
    const category = categorizeOption(option);
    categorized[category].push(option);
  });

  return categorized;
};

export const getCategoryLabel = (category: OptionCategory, t: (key: string) => string): string => {
  const labels: Record<OptionCategory, string> = {
    frame: t('root.themes.customize.frame'),
    'text-style': t('root.themes.customize.text-style'),
    'text-content': t('root.themes.customize.text-content'),
    effects: t('root.themes.customize.effects'),
  };
  return labels[category];
};

export type { OptionCategory, CategorizedOptions };
