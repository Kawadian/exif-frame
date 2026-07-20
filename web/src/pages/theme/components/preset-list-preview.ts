import Photo from '../../../core/photo';
import free from '../../../core/drawing/free';
import { MAX_SIZE, runWithPreviewMaxSize } from '../../../core/drawing/sandbox';
import themes from '../../../themes';
import { Store, useStore } from '../../../store';
import { ThemeOption, ThemeOptionInput, getConverter } from '../types/theme-option';
import Customize from '../database/customize';
import { whenMakerLogosReady } from '../../../themes/maker-logo';
import type { PresetOptionValue } from '../types/preset';
import { photoKeyOf } from './theme-list-preview';

const PREVIEW_MAX_SIZE = 480;
const SOURCE_MAX_DIM = 640;

type IdleDeadlineLike = { timeRemaining: () => number; didTimeout: boolean };
type IdleCallback = (deadline: IdleDeadlineLike) => void;

type PreviewTask = {
  presetId: string;
  themeName: string;
  photoKey: string;
  generation: number;
  photo: Photo;
  options: Record<string, PresetOptionValue>;
  notCroppedMode: boolean;
  onResult: (presetId: string, dataUrl: string | null) => void;
};

const shouldScaleOption = (option: ThemeOption): boolean => {
  if (option.type === 'boolean' || option.type === 'string' || option.type === 'select' || option.type === 'color') return false;
  if (option.id.includes('OPACITY') || option.id.includes('ALPHA') || option.id.includes('WEIGHT')) return false;
  if (option.type === 'range-slider' && option.max <= 1) return false;
  return option.type === 'number' || option.type === 'range-slider';
};

const buildScaledInput = (
  options: ThemeOption[] | undefined,
  themeName: string,
  scale: number,
  overrides?: Record<string, PresetOptionValue>
): ThemeOptionInput => {
  const input: ThemeOptionInput = new Map();
  options?.forEach((option) => {
    const saved = overrides?.[option.id] ?? Customize.get(themeName, option.id, getConverter(option.type));
    let value: PresetOptionValue = saved !== null && saved !== undefined ? saved : option.default;
    if (typeof value === 'number' && shouldScaleOption(option)) {
      value = value * scale;
    }
    input.set(option.id, value);
  });
  return input;
};

const createDownscaledPhoto = (photo: Photo, maxDim: number): Photo => {
  const { width, height } = photo.image;
  const longest = Math.max(width, height);
  if (longest <= maxDim) return photo;

  const scale = maxDim / longest;
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(photo.image, 0, 0, targetWidth, targetHeight);

  const scaledImage = new Image();
  scaledImage.width = targetWidth;
  scaledImage.height = targetHeight;
  scaledImage.src = canvas.toDataURL('image/jpeg', 0.85);
  free(canvas);

  const clone = Object.create(Object.getPrototypeOf(photo)) as Photo;
  Object.assign(clone, photo);
  clone.image = scaledImage;
  return clone;
};

const waitForImage = (image: HTMLImageElement): Promise<void> => {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Failed to load preview source image'));
  });
};

const requestIdle = (callback: IdleCallback, timeout = 500): number => {
  const ric = (window as Window & { requestIdleCallback?: (cb: IdleCallback, opts?: { timeout: number }) => number }).requestIdleCallback;
  if (ric) return ric(callback, { timeout });
  return window.setTimeout(() => callback({ timeRemaining: () => 0, didTimeout: true }), 32) as unknown as number;
};

const cancelIdle = (handle: number) => {
  const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
  if (cic) cic(handle);
  else window.clearTimeout(handle);
};

class PresetListPreviewQueue {
  private queue: PreviewTask[] = [];
  private running = false;
  private idleHandle: number | null = null;
  private generation = 0;
  private activePhotoKey: string | null = null;
  private sourceCache: { key: string; photo: Photo } | null = null;

  invalidate() {
    this.generation += 1;
    this.queue = [];
    this.activePhotoKey = null;
    this.sourceCache = null;
    if (this.idleHandle !== null) {
      cancelIdle(this.idleHandle);
      this.idleHandle = null;
    }
    this.running = false;
  }

  private async getSourcePhoto(photo: Photo): Promise<Photo> {
    const key = photoKeyOf(photo);
    if (this.sourceCache?.key === key) return this.sourceCache.photo;

    const sourcePhoto = createDownscaledPhoto(photo, SOURCE_MAX_DIM);
    if (sourcePhoto !== photo) {
      await waitForImage(sourcePhoto.image);
    }
    this.sourceCache = { key, photo: sourcePhoto };
    return sourcePhoto;
  }

  enqueue(
    presetId: string,
    themeName: string,
    options: Record<string, PresetOptionValue>,
    notCroppedMode: boolean,
    photo: Photo,
    onResult: PreviewTask['onResult'],
    prioritize = false
  ) {
    const photoKey = photoKeyOf(photo);

    if (this.activePhotoKey && this.activePhotoKey !== photoKey) {
      this.generation += 1;
      this.queue = [];
      this.sourceCache = null;
    }
    this.activePhotoKey = photoKey;

    this.queue = this.queue.filter((task) => !(task.presetId === presetId && task.photoKey === photoKey));

    const task: PreviewTask = {
      presetId,
      themeName,
      photoKey,
      generation: this.generation,
      photo,
      options,
      notCroppedMode,
      onResult,
    };

    if (prioritize) this.queue.unshift(task);
    else this.queue.push(task);

    this.schedule();
  }

  private schedule() {
    if (this.running || this.queue.length === 0) return;
    this.running = true;
    this.idleHandle = requestIdle((deadline) => {
      this.idleHandle = null;
      void this.process(deadline);
    });
  }

  private async process(deadline: IdleDeadlineLike) {
    const task = this.queue.shift();
    if (!task) {
      this.running = false;
      return;
    }

    if (task.generation !== this.generation) {
      this.running = false;
      this.schedule();
      return;
    }

    if (deadline.timeRemaining() < 8 && !deadline.didTimeout && this.queue.length > 0) {
      this.queue.unshift(task);
      this.running = false;
      this.schedule();
      return;
    }

    try {
      await whenMakerLogosReady();
      const sourcePhoto = await this.getSourcePhoto(task.photo);
      if (task.generation !== this.generation) {
        this.running = false;
        this.schedule();
        return;
      }

      const theme = themes.find((item) => item.name === task.themeName);
      if (!theme?.func) {
        task.onResult(task.presetId, null);
      } else {
        const store = { ...(useStore.getState() as Store), notCroppedMode: task.notCroppedMode };
        const scale = PREVIEW_MAX_SIZE / MAX_SIZE;
        const input = buildScaledInput(theme.options, theme.name, scale, task.options);
        const canvas = runWithPreviewMaxSize(PREVIEW_MAX_SIZE, () => theme.func(sourcePhoto, input, store));
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        free(canvas);
        if (task.generation === this.generation) {
          task.onResult(task.presetId, dataUrl);
        }
      }
    } catch {
      if (task.generation === this.generation) {
        task.onResult(task.presetId, null);
      }
    }

    this.running = false;
    if (this.queue.length > 0) {
      this.idleHandle = requestIdle(() => {
        this.idleHandle = null;
        void this.process({ timeRemaining: () => 0, didTimeout: true });
      }, 1000);
    }
  }
}

const presetListPreviewQueue = new PresetListPreviewQueue();

export { presetListPreviewQueue };
