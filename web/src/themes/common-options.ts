import { ThemeOption } from '../pages/theme/types/theme-option';
import Font from '../fonts';
import { ASPECT_RATIO_OPTIONS } from '../constants/aspect-ratios';

/**
 * 共通オプション定義
 * 各テーマで再利用可能なオプションを定義
 */

// アスペクト比
export const createAspectRatioOption = (): ThemeOption => ({
  id: 'ASPECT_RATIO',
  type: 'select',
  options: ASPECT_RATIO_OPTIONS,
  default: 'free',
  description: 'theme.option.aspect-ratio',
  category: 'frame'
});

// 背景関連
export const createBackgroundColorOption = (defaultValue: string = '#ffffff'): ThemeOption => ({
  id: 'BACKGROUND_COLOR',
  type: 'color',
  default: defaultValue,
  description: 'theme.option.background-color',
  category: 'frame'
});

export const createBlurBackgroundOption = (): ThemeOption => ({
  id: 'BLUR_BACKGROUND',
  type: 'boolean',
  default: false,
  description: 'theme.option.blur-background',
  category: 'frame'
});

export const createBlurAmountOption = (): ThemeOption => ({
  id: 'BLUR_AMOUNT',
  type: 'range-slider',
  default: 20,
  min: 0,
  max: 100,
  step: 1,
  description: 'theme.option.blur-amount',
  category: 'frame'
});

// パディング関連
export const createPaddingInsideOption = (defaultValue: boolean = false): ThemeOption => ({
  id: 'PADDING_INSIDE',
  type: 'boolean',
  default: defaultValue,
  description: 'theme.option.padding-inside',
  category: 'frame'
});

export const createPaddingTopOption = (defaultValue: number = 100): ThemeOption => ({
  id: 'PADDING_TOP',
  type: 'number',
  default: defaultValue,
  min: 0,
  max: 500,
  step: 1,
  description: 'theme.option.padding-top',
  category: 'frame'
});

export const createPaddingBottomOption = (defaultValue: number = 100): ThemeOption => ({
  id: 'PADDING_BOTTOM',
  type: 'number',
  default: defaultValue,
  min: 0,
  max: 500,
  step: 1,
  description: 'theme.option.padding-bottom',
  category: 'frame'
});

export const createPaddingLeftOption = (defaultValue: number = 100): ThemeOption => ({
  id: 'PADDING_LEFT',
  type: 'number',
  default: defaultValue,
  min: 0,
  max: 500,
  step: 1,
  description: 'theme.option.padding-left',
  category: 'frame'
});

export const createPaddingRightOption = (defaultValue: number = 100): ThemeOption => ({
  id: 'PADDING_RIGHT',
  type: 'number',
  default: defaultValue,
  min: 0,
  max: 500,
  step: 1,
  description: 'theme.option.padding-right',
  category: 'frame'
});

// テキスト関連
export const createTextColorOption = (defaultValue: string = '#000000'): ThemeOption => ({
  id: 'TEXT_COLOR',
  type: 'color',
  default: defaultValue,
  description: 'theme.option.text-color',
  category: 'text'
});

export const createTextAlphaOption = (defaultValue: number = 1): ThemeOption => ({
  id: 'TEXT_ALPHA',
  type: 'range-slider',
  default: defaultValue,
  min: 0,
  max: 1,
  step: 0.01,
  description: 'theme.option.text-alpha',
  category: 'text'
});

export const createTextAlignOption = (defaultValue: 'center' | 'left' | 'right' = 'center'): ThemeOption => ({
  id: 'TEXT_ALIGN',
  type: 'select',
  options: ['center', 'right', 'left'],
  default: defaultValue,
  description: 'theme.option.text-align',
  category: 'text'
});

// フォント関連
export const createFontStyleOption = (defaultValue: 'normal' | 'italic' = 'normal'): ThemeOption => ({
  id: 'FONT_STYLE',
  type: 'select',
  options: ['normal', 'italic'],
  default: defaultValue,
  description: 'theme.option.font-style',
  category: 'text'
});

export const createFontWeightOption = (defaultValue: number = 500): ThemeOption => ({
  id: 'FONT_WEIGHT',
  type: 'range-slider',
  min: 100,
  max: 900,
  step: 100,
  default: defaultValue,
  description: 'theme.option.font-weight',
  category: 'text'
});

export const createFontSizeOption = (defaultValue: number = 70): ThemeOption => ({
  id: 'FONT_SIZE',
  type: 'number',
  default: defaultValue,
  min: 8,
  max: 200,
  step: 1,
  description: 'theme.option.font-size',
  category: 'text'
});

export const createFontFamilyOption = (defaultValue: string = 'Barlow'): ThemeOption => ({
  id: 'FONT_FAMILY',
  type: 'select',
  options: ['Default', 'Barlow', ...Object.values(Font)],
  default: defaultValue,
  description: 'theme.option.font-family',
  category: 'text'
});

// ロゴ関連
export const createShowLogoOption = (defaultValue: boolean = true): ThemeOption => ({
  id: 'SHOW_LOGO',
  type: 'boolean',
  default: defaultValue,
  description: 'theme.option.show-logo',
  category: 'text'
});

export const createLogoDarkModeOption = (defaultValue: boolean = true): ThemeOption => ({
  id: 'LOGO_DARK_MODE',
  type: 'boolean',
  default: defaultValue,
  description: 'theme.option.logo-dark-mode',
  category: 'text'
});

export const createLogoHeightOption = (defaultValue: number = 140): ThemeOption => ({
  id: 'LOGO_HEIGHT',
  type: 'number',
  default: defaultValue,
  min: 0,
  max: 400,
  step: 1,
  description: 'theme.option.logo-height',
  category: 'text'
});

export const createLogoMaxWidthOption = (defaultValue: number = 400): ThemeOption => ({
  id: 'LOGO_MAX_WIDTH',
  type: 'number',
  default: defaultValue,
  min: 0,
  max: 1000,
  step: 1,
  description: 'theme.option.logo-max-width',
  category: 'text'
});

// ラベル・テンプレート関連
export const createTopLabelOption = (defaultValue: string = ''): ThemeOption => ({
  id: 'TOP_LABEL',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.top-label',
  category: 'text'
});

export const createDividerOption = (defaultValue: string = ' '): ThemeOption => ({
  id: 'DIVIDER',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.divider',
  category: 'text'
});

export const createLineGapOption = (defaultValue: number = 0): ThemeOption => ({
  id: 'LINE_GAP',
  type: 'number',
  default: defaultValue,
  min: 0,
  max: 200,
  step: 1,
  description: 'theme.option.line-gap',
  category: 'text'
});

// テンプレート
export const createTemplate1Option = (defaultValue: string): ThemeOption => ({
  id: 'TEMPLATE1',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.template1',
  category: 'text'
});

export const createTemplate2Option = (defaultValue: string): ThemeOption => ({
  id: 'TEMPLATE2',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.template2',
  category: 'text'
});

export const createTemplate3Option = (defaultValue: string): ThemeOption => ({
  id: 'TEMPLATE3',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.template3',
  category: 'text'
});

export const createTemplate4Option = (defaultValue: string): ThemeOption => ({
  id: 'TEMPLATE4',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.template4',
  category: 'text'
});

// その他のカスタムオプション
export const createDarkModeOption = (defaultValue: boolean = false): ThemeOption => ({
  id: 'DARK_MODE',
  type: 'boolean',
  default: defaultValue,
  description: 'theme.option.dark-mode',
  category: 'frame'
});

export const createArtistOption = (defaultValue: string = ''): ThemeOption => ({
  id: 'ARTIST',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.artist',
  category: 'text'
});

export const createCompactOption = (defaultValue: boolean = false): ThemeOption => ({
  id: 'COMPACT',
  type: 'boolean',
  default: defaultValue,
  description: 'theme.option.compact',
  category: 'text'
});

export const createLabelOption = (defaultValue: string = '@username'): ThemeOption => ({
  id: 'LABEL',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.label',
  category: 'text'
});

// 写真のボーダー・シャドウ
export const createPhotoBorderWidthOption = (defaultValue: number = 0): ThemeOption => ({
  id: 'PHOTO_BORDER_WIDTH',
  type: 'number',
  default: defaultValue,
  min: 0,
  max: 50,
  step: 1,
  description: 'theme.option.photo-border-width',
  category: 'photo'
});

export const createPhotoBorderColorOption = (defaultValue: string = '#000000'): ThemeOption => ({
  id: 'PHOTO_BORDER_COLOR',
  type: 'color',
  default: defaultValue,
  description: 'theme.option.photo-border-color',
  category: 'photo'
});

export const createShadowOffsetXOption = (defaultValue: number = 0): ThemeOption => ({
  id: 'SHADOW_OFFSET_X',
  type: 'number',
  default: defaultValue,
  min: -200,
  max: 200,
  step: 1,
  description: 'theme.option.shadow-offset-x',
  category: 'photo'
});

export const createShadowOffsetYOption = (defaultValue: number = 0): ThemeOption => ({
  id: 'SHADOW_OFFSET_Y',
  type: 'number',
  default: defaultValue,
  min: -200,
  max: 200,
  step: 1,
  description: 'theme.option.shadow-offset-y',
  category: 'photo'
});

export const createShadowBlurOption = (defaultValue: number = 0): ThemeOption => ({
  id: 'SHADOW_BLUR',
  type: 'number',
  default: defaultValue,
  min: 0,
  max: 200,
  step: 1,
  description: 'theme.option.shadow-blur',
  category: 'photo'
});

export const createShadowColorOption = (defaultValue: string = '#000000'): ThemeOption => ({
  id: 'SHADOW_COLOR',
  type: 'color',
  default: defaultValue,
  description: 'theme.option.shadow-color',
  category: 'photo'
});

export const createShadowOpacityOption = (defaultValue: number = 0.5): ThemeOption => ({
  id: 'SHADOW_OPACITY',
  type: 'range-slider',
  default: defaultValue,
  min: 0,
  max: 1,
  step: 0.01,
  description: 'theme.option.shadow-opacity',
  category: 'photo'
});

export const createShadowSizeOption = (defaultValue: number = 10): ThemeOption => ({
  id: 'SHADOW_SIZE',
  type: 'number',
  default: defaultValue,
  min: 0,
  max: 100,
  step: 1,
  description: 'theme.option.shadow-size',
  category: 'photo'
});

export const createShowShadowOption = (defaultValue: boolean = true): ThemeOption => ({
  id: 'SHOW_SHADOW',
  type: 'boolean',
  default: defaultValue,
  description: 'theme.option.show-shadow',
  category: 'photo'
});

export const createLetterSpacingOption = (defaultValue: number = 12): ThemeOption => ({
  id: 'LETTER_SPACING',
  type: 'range-slider',
  default: defaultValue,
  min: 0,
  max: 40,
  step: 1,
  description: 'theme.option.letter-spacing',
  category: 'text'
});

export const createTextToPhotoGapOption = (defaultValue: number = 72): ThemeOption => ({
  id: 'TEXT_TO_PHOTO_GAP',
  type: 'number',
  default: defaultValue,
  min: 0,
  max: 300,
  step: 1,
  description: 'theme.option.text-to-photo-gap',
  category: 'text'
});

// テキスト（カスタム用）
export const createTextOption = (defaultValue: string = 'Your Text'): ThemeOption => ({
  id: 'TEXT',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.text',
  category: 'text'
});

export const createText1Option = (defaultValue: string = 'Your Text'): ThemeOption => ({
  id: 'TEXT1',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.text1',
  category: 'text'
});

export const createText2Option = (defaultValue: string = 'Your Text'): ThemeOption => ({
  id: 'TEXT2',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.text2',
  category: 'text'
});

export const createText3Option = (defaultValue: string): ThemeOption => ({
  id: 'TEXT3',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.text3',
  category: 'text'
});

export const createText4Option = (defaultValue: string): ThemeOption => ({
  id: 'TEXT4',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.text4',
  category: 'text'
});

export const createText5Option = (defaultValue: string): ThemeOption => ({
  id: 'TEXT5',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.text5',
  category: 'text'
});

// サイズ・ウェイト設定用のカスタムオプション
export const createCustomSizeOption = (id: string, defaultValue: number, descriptionKey: string): ThemeOption => ({
  id,
  type: 'number',
  default: defaultValue,
  min: 8,
  max: 200,
  step: 1,
  description: descriptionKey,
  category: 'text'
});

export const createCustomWeightOption = (id: string, defaultValue: number, descriptionKey: string): ThemeOption => ({
  id,
  type: 'range-slider',
  min: 100,
  max: 900,
  step: 100,
  default: defaultValue,
  description: descriptionKey,
  category: 'text'
});

export const createHideTextOption = (defaultValue: boolean = false): ThemeOption => ({
  id: 'HIDE_TEXT',
  type: 'boolean',
  default: defaultValue,
  description: 'theme.option.hide-text',
  category: 'text'
});

export const createTagOption = (defaultValue: string): ThemeOption => ({
  id: 'TAG',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.tag',
  category: 'text'
});

export const createTitleOption = (defaultValue: string): ThemeOption => ({
  id: 'TITLE',
  type: 'string',
  default: defaultValue,
  description: 'theme.option.title',
  category: 'text'
});

export const createDescriptionOption = (id: string, defaultValue: string): ThemeOption => ({
  id,
  type: 'string',
  default: defaultValue,
  description: `theme.option.${id.toLowerCase()}`,
  category: 'text'
});
