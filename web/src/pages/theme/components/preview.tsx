import render from '../../../core/drawing/render';
import { useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useStore } from '../../../store';
import themes from '../../../themes';
import { ThemeOptionInput, getConverter } from '../types/theme-option';
import Customize from '../database/customize';
import free from '../../../core/drawing/free';
import DragHandleIcon from '../../../icons/drag-handle.icon';

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 600;
const DEFAULT_HEIGHT = 250;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const PINCH_ZOOM_SENSITIVITY = 200;

interface PreviewProps {
  height: number;
  onHeightChange: (height: number) => void;
}

export interface PreviewRef {
  resetZoom: () => void;
}

const Preview = forwardRef<PreviewRef, PreviewProps>(({ height, onHeightChange }, ref) => {
  const store = useStore();
  const { selectedThemeName, rerenderOptions, tabIndex } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const panStartX = useRef(0);
  const panStartY = useRef(0);
  const panStartOffsetX = useRef(0);
  const panStartOffsetY = useRef(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number>(0);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  const clampZoom = (value: number) => Math.min(Math.max(MIN_ZOOM, value), MAX_ZOOM);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      resetZoom,
    }),
    [resetZoom]
  );

  const shouldEnablePan = (element: EventTarget | null, isCanvas: boolean = false) => {
    // キャンバスからの操作か、ズーム中かつリサイズハンドルでない場合にパンを有効化
    return isCanvas || (scale > 1 && element instanceof HTMLElement && !element.classList.contains('cursor-ns-resize'));
  };

  const startPanning = (clientX: number, clientY: number) => {
    setIsPanning(true);
    panStartX.current = clientX;
    panStartY.current = clientY;
    panStartOffsetX.current = panX;
    panStartOffsetY.current = panY;
  };

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
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = -e.deltaY;
      const zoomFactor = delta > 0 ? 1.1 : 0.9;

      setScale((prevScale) => {
        const newScale = clampZoom(prevScale * zoomFactor);

        // Calculate zoom origin relative to canvas center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = mouseX - centerX;
        const offsetY = mouseY - centerY;

        // Adjust pan to zoom towards cursor (guard against division by zero)
        if (prevScale > 0) {
          setPanX((prevPanX) => prevPanX - offsetX * (newScale / prevScale - 1));
          setPanY((prevPanY) => prevPanY - offsetY * (newScale / prevScale - 1));
        }

        return newScale;
      });
    }
  }, []);

  const handlePinchZoom = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));

      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      if (lastTouchDistance.current > 0 && lastTouchCenter.current) {
        const delta = distance - lastTouchDistance.current;
        const zoomFactor = 1 + delta / PINCH_ZOOM_SENSITIVITY;

        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const touchX = centerX - rect.left;
          const touchY = centerY - rect.top;
          const canvasCenterX = rect.width / 2;
          const canvasCenterY = rect.height / 2;
          const offsetX = touchX - canvasCenterX;
          const offsetY = touchY - canvasCenterY;

          setScale((prevScale) => {
            const newScale = clampZoom(prevScale * zoomFactor);

            // Adjust pan to zoom towards touch center (guard against division by zero)
            if (prevScale > 0) {
              setPanX((prevPanX) => prevPanX - offsetX * (newScale / prevScale - 1));
              setPanY((prevPanY) => prevPanY - offsetY * (newScale / prevScale - 1));
            }

            return newScale;
          });
        }
      }

      lastTouchDistance.current = distance;
      lastTouchCenter.current = { x: centerX, y: centerY };
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      lastTouchDistance.current = 0;
      lastTouchCenter.current = null;
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

  // Reset pan when scale is 1
  useEffect(() => {
    if (scale === 1) {
      setPanX(0);
      setPanY(0);
    }
  }, [scale]);

  // マウスイベント（リサイズハンドル用）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (shouldEnablePan(e.currentTarget)) {
      // Pan mode when zoomed
      e.preventDefault();
      startPanning(e.clientX, e.clientY);
    } else {
      // Resize mode
      e.preventDefault();
      handleDragStart(e.clientY);
    }
  };

  // マウスイベント（キャンバス用）
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      startPanning(e.clientX, e.clientY);
    }
  };

  // タッチイベント（リサイズハンドル用）
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && shouldEnablePan(e.currentTarget)) {
      // Pan mode when zoomed with single touch
      startPanning(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 1) {
      // Resize mode with single touch
      handleDragStart(e.touches[0].clientY);
    }
  };

  // タッチイベント（キャンバス用）
  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      e.preventDefault();
      startPanning(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - panStartX.current;
        const deltaY = e.clientY - panStartY.current;
        setPanX(panStartOffsetX.current + deltaX);
        setPanY(panStartOffsetY.current + deltaY);
      } else {
        handleDragMove(e.clientY);
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      handleDragEnd();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        if (isPanning) {
          e.preventDefault();
          const deltaX = e.touches[0].clientX - panStartX.current;
          const deltaY = e.touches[0].clientY - panStartY.current;
          setPanX(panStartOffsetX.current + deltaX);
          setPanY(panStartOffsetY.current + deltaY);
        } else if (isDragging) {
          e.preventDefault();
          handleDragMove(e.touches[0].clientY);
        }
      }
    };

    const handleTouchEnd = () => {
      setIsPanning(false);
      handleDragEnd();
    };

    if (isDragging || isPanning) {
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
  }, [isDragging, isPanning, handleDragMove, handleDragEnd]);

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
        preview.width = 4000;
        preview.height = 4000 / ratio;
      } else {
        preview.height = 4000;
        preview.width = 4000 * ratio;
      }
      ctx.clearRect(0, 0, preview.width, preview.height);
      ctx.drawImage(canvas, 0, 0, preview.width, preview.height);
      free(canvas);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThemeName, rerenderOptions, tabIndex]);

  return (
    <div className="w-full flex flex-col items-center">
      <div ref={canvasRef} className="w-full flex justify-center items-center overflow-hidden bg-gray-200 dark:bg-gray-900" style={{ height: `${height}px` }}>
        <canvas
          id="preview"
          className="max-w-full max-h-full object-contain"
          style={{
            maxHeight: `${height}px`,
            transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            cursor: scale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
          }}
          onMouseDown={handleCanvasMouseDown}
          onTouchStart={handleCanvasTouchStart}
        />
      </div>
      {/* ドラッグハンドル */}
      <div
        className={`w-full flex justify-center cursor-ns-resize select-none touch-none ${isDragging ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} transition-colors`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="text-gray-400 dark:text-gray-500">
          <DragHandleIcon size={20} />
        </div>
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';

export { DEFAULT_HEIGHT, MIN_HEIGHT, MAX_HEIGHT };
export default Preview;
