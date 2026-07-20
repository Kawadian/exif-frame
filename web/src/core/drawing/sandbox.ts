import Photo from '../photo';

export const MAX_SIZE = 4096; // Mobile Safari has a maximum canvas size of 4096x4096

let previewMaxSize: number | null = null;

const getMaxSize = (): number => previewMaxSize ?? MAX_SIZE;

/** Scale factor relative to full-size export canvas (1 in normal renders). */
const getSizeScale = (): number => getMaxSize() / MAX_SIZE;

/**
 * Run a theme render at a reduced canvas size for list thumbnails.
 * Theme code that uses getMaxSize/getSizeScale will shrink with the preview.
 */
const runWithPreviewMaxSize = <T>(size: number, fn: () => T): T => {
  const previous = previewMaxSize;
  previewMaxSize = size;
  try {
    return fn();
  } finally {
    previewMaxSize = previous;
  }
};

interface SandboxOptions {
  backgroundColor: string;
  padding: { top: number; bottom: number; left: number; right: number };
  targetRatio: string;
  notCroppedMode: boolean;
  photoBorder?: { width: number; color: string };
  shadow?: { offsetX: number; offsetY: number; blur: number; color: string; opacity: number };
  blurBackground?: { amount: number };
}

const hexToRgba = (hex: string, alpha: number): string => {
  let normalizedHex = hex.replace('#', '');

  if (normalizedHex.length === 3) {
    normalizedHex = normalizedHex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const r = parseInt(normalizedHex.slice(0, 2), 16);
  const g = parseInt(normalizedHex.slice(2, 4), 16);
  const b = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const sanitizePadding = (padding: SandboxOptions['padding']) => ({
  top: Math.max(0, padding.top),
  bottom: Math.max(0, padding.bottom),
  left: Math.max(0, padding.left),
  right: Math.max(0, padding.right),
});

const getImageDrawRect = (image: HTMLImageElement, frame: { x: number; y: number; width: number; height: number }, mode: 'cover' | 'contain') => {
  const scale = mode === 'cover' ? Math.max(frame.width / image.width, frame.height / image.height) : Math.min(frame.width / image.width, frame.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;

  return {
    x: frame.x + (frame.width - width) / 2,
    y: frame.y + (frame.height - height) / 2,
    width,
    height,
  };
};

const drawBackground = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, image: HTMLImageElement, backgroundColor: string, blurBackground?: { amount: number }) => {
  if (!blurBackground) {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  context.save();
  context.filter = `blur(${Math.max(0, blurBackground.amount)}px)`;

  const rect = getImageDrawRect(image, { x: 0, y: 0, width: canvas.width, height: canvas.height }, 'cover');
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height);

  context.restore();
};

const drawPaddingMasks = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, padding: SandboxOptions['padding']) => {
  const { top, bottom, left, right } = padding;

  context.fillRect(0, 0, canvas.width, top);
  context.fillRect(0, canvas.height - bottom, canvas.width, bottom);
  context.fillRect(0, 0, left, canvas.height);
  context.fillRect(canvas.width - right, 0, right, canvas.height);
};

const drawEffects = (context: CanvasRenderingContext2D, rect: { x: number; y: number; width: number; height: number }, image: HTMLImageElement, photoBorder?: SandboxOptions['photoBorder'], shadow?: SandboxOptions['shadow']) => {
  if (shadow && shadow.blur > 0) {
    context.shadowOffsetX = shadow.offsetX;
    context.shadowOffsetY = shadow.offsetY;
    context.shadowBlur = shadow.blur;
    context.shadowColor = hexToRgba(shadow.color, shadow.opacity);
  }

  context.drawImage(image, rect.x, rect.y, rect.width, rect.height);

  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;
  context.shadowColor = 'transparent';

  if (photoBorder && photoBorder.width > 0) {
    context.strokeStyle = photoBorder.color;
    context.lineWidth = photoBorder.width;
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }
};

const sandbox = (photo: Photo, options: SandboxOptions): HTMLCanvasElement => {
  const { image } = photo;
  const { backgroundColor, targetRatio, notCroppedMode, photoBorder, shadow, blurBackground } = options;
  const padding = sanitizePadding(options.padding);
  const { top, bottom, left, right } = padding;
  const canvas = document.createElement('canvas');
  const maxSize = getMaxSize();

  if (targetRatio === 'free') {
    const availableWidth = Math.max(1, maxSize - left - right);
    const availableHeight = Math.max(1, maxSize - top - bottom);
    const scale = image.width >= image.height ? availableWidth / image.width : availableHeight / image.height;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = left;
    const imgY = top;

    canvas.width = Math.min(maxSize, imgWidth + left + right);
    canvas.height = Math.min(maxSize, imgHeight + top + bottom);

    const context = canvas.getContext('2d')!;
    drawBackground(context, canvas, image, backgroundColor, blurBackground);
    drawEffects(context, { x: imgX, y: imgY, width: imgWidth, height: imgHeight }, image, photoBorder, shadow);

    return canvas;
  }

  const ratio = targetRatio.split(':').map((value) => Number(value));

  if (ratio.length !== 2 || ratio[0] <= 0 || ratio[1] <= 0) {
    throw new Error('Invalid target ratio');
  }

  if (ratio[0] > ratio[1]) {
    canvas.width = maxSize;
    canvas.height = (ratio[1] / ratio[0]) * maxSize;
  } else {
    canvas.width = (ratio[0] / ratio[1]) * maxSize;
    canvas.height = maxSize;
  }

  const context = canvas.getContext('2d')!;
  drawBackground(context, canvas, image, backgroundColor, blurBackground);

  const frame = {
    x: left,
    y: top,
    width: Math.max(1, canvas.width - left - right),
    height: Math.max(1, canvas.height - top - bottom),
  };
  const rect = getImageDrawRect(image, frame, notCroppedMode ? 'contain' : 'cover');

  drawEffects(context, rect, image, photoBorder, shadow);

  if (!notCroppedMode && !blurBackground) {
    context.fillStyle = backgroundColor;
    drawPaddingMasks(context, canvas, padding);
  }

  return canvas;
};

export default sandbox;
export { getMaxSize, getSizeScale, runWithPreviewMaxSize };
