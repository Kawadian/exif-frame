import render from '../../../core/drawing/render';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '../../../store';
import themes from '../../../themes';
import { ThemeOptionInput, getConverter } from '../types/theme-option';
import Customize from '../database/customize';
import free from '../../../core/drawing/free';
import DragHandleIcon from '../../../icons/drag-handle.icon';

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 600;
const DEFAULT_HEIGHT = 250;

interface PreviewProps {
  height: number;
  onHeightChange: (height: number) => void;
}

const Preview = ({ height, onHeightChange }: PreviewProps) => {
  const store = useStore();
  const { selectedThemeName, rerenderOptions, tabIndex } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number>(0);

  const handleDragStart = useCallback(
    (clientY: number) => {
      setIsDragging(true);
      dragStartY.current = clientY;
      dragStartHeight.current = height;
    },
    [height]
  );

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      const delta = clientY - dragStartY.current;
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, dragStartHeight.current + delta));
      onHeightChange(newHeight);
    },
    [isDragging, onHeightChange]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom handlers
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomFactor = delta > 0 ? 1.1 : 0.9;
      setScale(prevScale => Math.min(Math.max(0.5, prevScale * zoomFactor), 3));
    }
  }, []);

  const handlePinchZoom = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      if (lastTouchDistance.current > 0) {
        const delta = distance - lastTouchDistance.current;
        const zoomFactor = 1 + delta / 200;
        setScale(prevScale => Math.min(Math.max(0.5, prevScale * zoomFactor), 3));
      }

      lastTouchDistance.current = distance;
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      lastTouchDistance.current = 0;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      canvas.addEventListener('touchmove', handlePinchZoom, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('touchmove', handlePinchZoom);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleWheel, handlePinchZoom, handleTouchEnd]);

  // マウスイベント
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  // タッチイベント
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleDragMove(e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => handleDragEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    const preview = document.getElementById('preview') as HTMLCanvasElement;
    preview.width = 0;
    preview.height = 0;

    if (store.photos.length === 0) return;
    if (tabIndex !== 1) return;

    const input: ThemeOptionInput = new Map<string, string | number | boolean>();
    const theme = themes.find((theme) => theme.name === selectedThemeName);
    theme?.options.forEach((option) => {
      const value = Customize.get(selectedThemeName, option.id, getConverter(option.type));
      if (value !== null) {
        input.set(option.id, value);
      } else {
        input.set(option.id, option.default);
      }
    });

    const func = theme?.func;

    render(func!, store.photos[0], input, store).then((canvas) => {
      const ctx = preview.getContext('2d')!;
      const ratio = canvas.width / canvas.height;
      if (preview.width > preview.height) {
        preview.width = 1000;
        preview.height = 1000 / ratio;
      } else {
        preview.height = 1000;
        preview.width = 1000 * ratio;
      }
      ctx.clearRect(0, 0, preview.width, preview.height);
      ctx.drawImage(canvas, 0, 0, preview.width, preview.height);
      free(canvas);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThemeName, rerenderOptions, tabIndex]);

  return (
    <div className="flex flex-col items-center">
      <div ref={canvasRef} className="w-full flex justify-center items-center overflow-hidden" style={{ height: `${height}px` }}>
        <canvas 
          id="preview" 
          className="max-w-full max-h-full object-contain" 
          style={{ 
            maxHeight: `${height}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out',
            cursor: scale > 1 ? 'grab' : 'default'
          }} 
        />
      </div>
      {/* ドラッグハンドル */}
      <div
        className={`w-full flex justify-center py-2 cursor-ns-resize select-none touch-none ${
          isDragging ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        } transition-colors`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="text-gray-400 dark:text-gray-500">
          <DragHandleIcon size={20} />
        </div>
      </div>
    </div>
  );
};

export { DEFAULT_HEIGHT, MIN_HEIGHT, MAX_HEIGHT };
export default Preview;
