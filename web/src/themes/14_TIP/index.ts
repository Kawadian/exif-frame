import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import * as CommonOptions from '../common-options';

const TIP_OPTIONS: ThemeOption[] = [
  CommonOptions.createDarkModeOption(false),
  CommonOptions.createBlurBackgroundOption(),
  CommonOptions.createBlurAmountOption(),
  CommonOptions.createHideTextOption(false),
  CommonOptions.createTagOption('TIP'),
  CommonOptions.createTitleOption('01. Lorem ipsum'),
  CommonOptions.createDescriptionOption('DESCRIPTION1', 'Pellentesque a pharetra justo'),
  CommonOptions.createDescriptionOption('DESCRIPTION2', 'Nam maximus risus et rhoncus eleifend'),
  CommonOptions.createPaddingTopOption(250),
  CommonOptions.createPaddingBottomOption(125),
  CommonOptions.createPhotoBorderWidthOption(0),
  CommonOptions.createPhotoBorderColorOption('#000000'),
  CommonOptions.createShadowOffsetXOption(0),
  CommonOptions.createShadowOffsetYOption(0),
  CommonOptions.createShadowBlurOption(0),
  CommonOptions.createShadowColorOption('#000000'),
  CommonOptions.createShadowOpacityOption(0.5),
  CommonOptions.createCustomSizeOption('TAG_SIZE', 140, 'px'),
  CommonOptions.createCustomWeightOption('TAG_WEIGHT', 700, '100 ~ 900'),
  CommonOptions.createCustomSizeOption('TITLE_SIZE', 120, 'px'),
  CommonOptions.createCustomWeightOption('TITLE_WEIGHT', 500, '100 ~ 900'),
  CommonOptions.createCustomSizeOption('DESCRIPTION_SIZE', 95, 'px'),
  CommonOptions.createCustomWeightOption('DESCRIPTION_WEIGHT', 200, '100 ~ 900'),
  CommonOptions.createCustomSizeOption('EXIF_SIZE', 60, 'px'),
  CommonOptions.createCustomWeightOption('EXIF_WEIGHT', 500, '100 ~ 900'),
  CommonOptions.createFontFamilyOption('Barlow'),
  CommonOptions.createShadowSizeOption(10),
];

const TIP_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const DARK_MODE = input.get('DARK_MODE') as boolean;
  const BLUR_BACKGROUND = input.get('BLUR_BACKGROUND') as boolean;
  const BLUR_AMOUNT = input.get('BLUR_AMOUNT') as number;
  const HIDE_TEXT = input.get('HIDE_TEXT') as boolean;
  const TAG = (input.get('TAG') as string).trim();
  const TITLE = (input.get('TITLE') as string).trim();
  const DESCRIPTION1 = (input.get('DESCRIPTION1') as string).trim();
  const DESCRIPTION2 = (input.get('DESCRIPTION2') as string).trim();
  const PADDING_TOP = input.get('PADDING_TOP') as number;
  const PADDING_BOTTOM = input.get('PADDING_BOTTOM') as number;
  const PHOTO_BORDER_WIDTH = input.get('PHOTO_BORDER_WIDTH') as number;
  const PHOTO_BORDER_COLOR = (input.get('PHOTO_BORDER_COLOR') as string).trim();
  const SHADOW_OFFSET_X = input.get('SHADOW_OFFSET_X') as number;
  const SHADOW_OFFSET_Y = input.get('SHADOW_OFFSET_Y') as number;
  const SHADOW_BLUR = input.get('SHADOW_BLUR') as number;
  const SHADOW_COLOR = (input.get('SHADOW_COLOR') as string).trim();
  const SHADOW_OPACITY = input.get('SHADOW_OPACITY') as number;
  const TAG_SIZE = input.get('TAG_SIZE') as number;
  const TAG_WEIGHT = input.get('TAG_WEIGHT') as number;
  const TITLE_SIZE = input.get('TITLE_SIZE') as number;
  const TITLE_WEIGHT = input.get('TITLE_WEIGHT') as number;
  const DESCRIPTION_SIZE = input.get('DESCRIPTION_SIZE') as number;
  const DESCRIPTION_WEIGHT = input.get('DESCRIPTION_WEIGHT') as number;
  const EXIF_SIZE = input.get('EXIF_SIZE') as number;
  const EXIF_WEIGHT = input.get('EXIF_WEIGHT') as number;
  const FONT_FAMILY = (input.get('FONT_FAMILY') as string).trim();
  const actualFontFamily = FONT_FAMILY === 'Default' ? 'sans-serif' : FONT_FAMILY;
  const SHADOW_SIZE = input.get('SHADOW_SIZE') as number;

  const canvas = sandbox(photo, {
    targetRatio: store.ratio,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: DARK_MODE ? '#ffffff' : '#000000',
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    blurBackground: BLUR_BACKGROUND ? { amount: BLUR_AMOUNT } : undefined,
    photoBorder: PHOTO_BORDER_WIDTH > 0 ? { width: PHOTO_BORDER_WIDTH, color: PHOTO_BORDER_COLOR } : undefined,
    shadow: SHADOW_BLUR > 0 ? { offsetX: SHADOW_OFFSET_X, offsetY: SHADOW_OFFSET_Y, blur: SHADOW_BLUR, color: SHADOW_COLOR, opacity: SHADOW_OPACITY } : undefined,
  });

  const context = canvas.getContext('2d')!;
  context.fillStyle = DARK_MODE ? '#000000' : '#ffffff';
  context.shadowColor = DARK_MODE ? '#ffffff' : '#000000';
  context.shadowBlur = SHADOW_SIZE;
  context.textBaseline = 'middle';
  context.textAlign = 'center';

  if (!HIDE_TEXT) {
    context.font = `normal ${TAG_WEIGHT} ${TAG_SIZE}px ${actualFontFamily}`;
    context.fillText(TAG, canvas.width / 2, PADDING_TOP);

    context.font = `normal ${TITLE_WEIGHT} ${TITLE_SIZE}px ${actualFontFamily}`;
    context.fillText(TITLE, canvas.width / 2, PADDING_TOP + TAG_SIZE + TITLE_SIZE / 2);

    context.font = `normal ${DESCRIPTION_WEIGHT} ${DESCRIPTION_SIZE}px ${actualFontFamily}`;
    context.fillText(DESCRIPTION1, canvas.width / 2, canvas.height - PADDING_BOTTOM - EXIF_SIZE - DESCRIPTION_SIZE * 2.2);
    context.fillText(DESCRIPTION2, canvas.width / 2, canvas.height - PADDING_BOTTOM - EXIF_SIZE - DESCRIPTION_SIZE);
  }

  if (!store.disableExposureMeter) {
    const exifWidth = canvas.width / 2;
    context.font = `normal ${EXIF_WEIGHT} ${EXIF_SIZE}px ${actualFontFamily}`;
    context.fillText(`${photo.fNumber?.replace('f/', 'F')}`, canvas.width / 2 - exifWidth / 2 + (exifWidth / 5) * 1, canvas.height - PADDING_BOTTOM);
    context.fillText(`${photo.exposureTime}`, canvas.width / 2 - exifWidth / 2 + (exifWidth / 5) * 2, canvas.height - PADDING_BOTTOM);
    context.fillText(`${photo.iso}`, canvas.width / 2 - exifWidth / 2 + (exifWidth / 5) * 3, canvas.height - PADDING_BOTTOM);
    context.fillText(`${photo.focalLength}`, canvas.width / 2 - exifWidth / 2 + (exifWidth / 5) * 4, canvas.height - PADDING_BOTTOM);
  }

  return canvas;
};

export { TIP_FUNC, TIP_OPTIONS };
