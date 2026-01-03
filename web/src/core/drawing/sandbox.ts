import Photo from '../photo';

export const MAX_SIZE = 4096; // Mobile Safari has a maximum canvas size of 4096x4096

interface SandboxOptions {
  backgroundColor: string;
  padding: { top: number; bottom: number; left: number; right: number };
  targetRatio: string;
  notCroppedMode: boolean;
  photoBorder?: { width: number; color: string };
  shadow?: { offsetX: number; offsetY: number; blur: number; color: string; opacity: number };
  blurBackground?: { amount: number };
}

// Note: Shadow and photo border effects are currently only applied in 'free' ratio mode
// to maintain simplicity and avoid potential rendering issues in complex ratio-based layouts

const sandbox = (photo: Photo, options: SandboxOptions): HTMLCanvasElement => {
  const { image } = photo;
  const { backgroundColor, padding, targetRatio, notCroppedMode, photoBorder, shadow, blurBackground } = options;
  const { top, bottom, left, right } = padding;

  const canvas = document.createElement('canvas');
  
  // Helper to parse hex color to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Handle short hex (e.g., #fff -> #ffffff)
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    
    // Parse RGB components
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // Track image boundaries for effects
  let imgX = 0, imgY = 0, imgWidth = 0, imgHeight = 0;

  const drawBlurredCoverBackground = (context: CanvasRenderingContext2D) => {
    const blurAmount = Math.max(0, blurBackground?.amount ?? 0);
    context.save();
    context.filter = `blur(${blurAmount}px)`;

    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const drawX = (canvas.width - drawWidth) / 2;
    const drawY = (canvas.height - drawHeight) / 2;
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    context.restore();
  };

  if (targetRatio === 'free') {
    if (image.width > image.height) {
      imgWidth = MAX_SIZE - left - right;
      imgHeight = (image.height / image.width) * imgWidth;
    } else {
      imgHeight = MAX_SIZE - top - bottom;
      imgWidth = (image.width / image.height) * imgHeight;
    }

    canvas.width = imgWidth + left + right;
    canvas.height = imgHeight + top + bottom;
    
    imgX = left;
    imgY = top;

    const context = canvas.getContext('2d')!;
    if (blurBackground) {
      drawBlurredCoverBackground(context);
    } else {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Apply shadow before drawing the image
    if (shadow && shadow.blur > 0) {
      context.shadowOffsetX = shadow.offsetX;
      context.shadowOffsetY = shadow.offsetY;
      context.shadowBlur = shadow.blur;
      context.shadowColor = hexToRgba(shadow.color, shadow.opacity);
    }
    
    context.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    
    // Reset shadow
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;
    context.shadowColor = 'transparent';
    
    // Apply photo border if specified
    if (photoBorder && photoBorder.width > 0) {
      context.strokeStyle = photoBorder.color;
      context.lineWidth = photoBorder.width;
      context.strokeRect(imgX, imgY, imgWidth, imgHeight);
    }
  } else {
    const ratio = targetRatio.split(':').map((value) => Number(value));

    if (ratio.length !== 2) {
      throw new Error('Invalid target ratio');
    }

    if (ratio[0] <= 0 || ratio[1] <= 0) {
      throw new Error('Invalid target ratio');
    }

    if (ratio[0] > ratio[1]) {
      canvas.width = MAX_SIZE;
      canvas.height = (ratio[1] / ratio[0]) * MAX_SIZE;
    } else {
      canvas.width = (ratio[0] / ratio[1]) * MAX_SIZE;
      canvas.height = MAX_SIZE;
    }

    const context = canvas.getContext('2d')!;
    if (blurBackground) {
      drawBlurredCoverBackground(context);
    } else {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (!notCroppedMode) {
      if (image.width > image.height) {
        const imageHeight = canvas.height - top - bottom;
        const imageWidth = (image.width / image.height) * imageHeight;
        context.drawImage(image, 0, 0, image.width, image.height, (MAX_SIZE - imageWidth) / 2, top, imageWidth, imageHeight);
        if (!blurBackground) {
          context.fillRect(0, 0, left, canvas.height);
          context.fillRect(canvas.width - right, 0, right, canvas.height);
        }
      }

      if (image.width < image.height) {
        const imageWidth = canvas.width - left - right;
        const imageHeight = (image.height / image.width) * imageWidth;
        context.drawImage(image, 0, 0, image.width, image.height, left, (MAX_SIZE - imageHeight) / 2, imageWidth, imageHeight);
        if (!blurBackground) {
          context.fillRect(0, 0, canvas.width, top);
          context.fillRect(0, canvas.height - bottom, canvas.width, bottom);
        }
      }
    } else {
      if (ratio[0] > ratio[1]) {
        let imageHeight = canvas.height - top - bottom;
        let imageWidth = canvas.width - left - right;
        if (image.width / image.height > ratio[0] / ratio[1]) {
          imageHeight = (image.height / image.width) * imageWidth;
        } else {
          imageWidth = (image.width / image.height) * imageHeight;
        }
        context.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          left + (canvas.width - left - right - imageWidth) / 2,
          top + (canvas.height - top - bottom - imageHeight) / 2,
          imageWidth,
          imageHeight
        );
      } else {
        let imageWidth = canvas.width - left - right;
        let imageHeight = canvas.height - top - bottom;
        if (image.width / image.height > ratio[0] / ratio[1]) {
          imageHeight = (image.height / image.width) * imageWidth;
        } else {
          imageWidth = (image.width / image.height) * imageHeight;
        }
        context.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          left + (canvas.width - left - right - imageWidth) / 2,
          top + (canvas.height - top - bottom - imageHeight) / 2,
          imageWidth,
          imageHeight
        );
      }
    }
  }

  return canvas;
};

export default sandbox;
