import { BlockTitle, List, Navbar, Page, Tabbar, TabbarLink } from 'konsta/react';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import SettingsIcon from '../../icons/settings.icon';
import ImageIcon from '../../icons/image.icon';
import GenerateIcon from '../../icons/generate.icon';
import PanelLeftIcon from '../../icons/panel-left.icon';
import themes from '../../themes';
import ThemeListItem from './components/theme.list-item';
import ThemeOptionListInput from './components/theme-option.list-input';
import NotCroppedModeListItem from './components/not-cropped-mode.list-item';
import Loading from '../convert/components/loading';
import ThemeOptionResetButton from './components/theme-option-reset.button';
import Preview, { DEFAULT_HEIGHT } from './components/preview';
import type { PreviewRef } from './components/preview';
import RerenderButton from './components/rerender.button';
import render from '../../core/drawing/render';
import { ThemeOptionInput, getConverter } from './types/theme-option';
import Customize from './database/customize';
import free from '../../core/drawing/free';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

const ThemeSettingsPage = () => {
  const { t } = useTranslation();
  const { selectedThemeName, setTabIndex, drawerOpen, setDrawerOpen, rerenderOptions, tabIndex, previewPhoto, photos } = useStore();
  const theme = themes.find((theme) => theme.name === selectedThemeName);
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'customize'>('list');
  const [previewHeight, setPreviewHeight] = useState(DEFAULT_HEIGHT);
  const [isMobile, setIsMobile] = useState(false);
  const previewRef = useRef<PreviewRef>(null);
  
  // Desktop preview states
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStartX = useRef(0);
  const panStartY = useRef(0);
  const panStartOffsetX = useRef(0);
  const panStartOffsetY = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hasCustomizeOptions = theme?.options && theme.options.length > 0;

  // Desktop preview zoom and pan handlers
  const clampZoom = (value: number) => Math.min(Math.max(MIN_ZOOM, value), MAX_ZOOM);

  const resetZoom = () => {
    setScale(1);
    setPanX(0);
    setPanY(0);
  };

  const startPanning = (clientX: number, clientY: number) => {
    setIsPanning(true);
    panStartX.current = clientX;
    panStartY.current = clientY;
    panStartOffsetX.current = panX;
    panStartOffsetY.current = panY;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      startPanning(e.clientX, e.clientY);
    }
  };

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      e.preventDefault();
      startPanning(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Handle mouse/touch move and up for panning
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - panStartX.current;
        const deltaY = e.clientY - panStartY.current;
        setPanX(panStartOffsetX.current + deltaX);
        setPanY(panStartOffsetY.current + deltaY);
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isPanning) {
        e.preventDefault();
        const deltaX = e.touches[0].clientX - panStartX.current;
        const deltaY = e.touches[0].clientY - panStartY.current;
        setPanX(panStartOffsetX.current + deltaX);
        setPanY(panStartOffsetY.current + deltaY);
      }
    };

    const handleTouchEnd = () => {
      setIsPanning(false);
    };

    if (isPanning) {
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
  }, [isPanning]);

  // Handle wheel zoom for desktop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMobile) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
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

          // Adjust pan to zoom towards cursor
          if (prevScale > 0) {
            setPanX((prevPanX) => prevPanX - offsetX * (newScale / prevScale - 1));
            setPanY((prevPanY) => prevPanY - offsetY * (newScale / prevScale - 1));
          }

          return newScale;
        });
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [isMobile]);

  // Reset pan when scale is 1
  useEffect(() => {
    if (scale === 1) {
      setPanX(0);
      setPanY(0);
    }
  }, [scale]);

  // Render canvas for desktop preview
  useEffect(() => {
    if (isMobile || !canvasRef.current) return;
    
    const preview = canvasRef.current;
    const store = useStore.getState();
    
    preview.width = 0;
    preview.height = 0;

    if (store.photos.length === 0) return;
    if (tabIndex !== 1) return;

    const photoToPreview = previewPhoto || store.photos[0];

    const input: ThemeOptionInput = new Map<string, string | number | boolean>();
    const currentTheme = themes.find((theme) => theme.name === selectedThemeName);
    
    if (!currentTheme || !currentTheme.func) return;
    
    currentTheme.options?.forEach((option) => {
      const value = Customize.get(selectedThemeName, option.id, getConverter(option.type));
      if (value !== null) {
        input.set(option.id, value);
      } else {
        input.set(option.id, option.default);
      }
    });

    const func = currentTheme.func;

    render(func, photoToPreview, input, store).then((canvas) => {
      const ctx = preview.getContext('2d');
      if (!ctx) return;
      
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
  }, [selectedThemeName, rerenderOptions, tabIndex, previewPhoto, photos, isMobile]);

  useEffect(() => {
    // Initialize isMobile state
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile layout (existing vertical layout)
  if (isMobile) {
    return (
      <Page style={{ paddingBottom: '10rem' }}>
        <Navbar large transparent title={t('root.themes')} />
        <div className="sticky z-50 bg-gray-100 dark:bg-black shadow-md" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <Preview ref={previewRef} height={previewHeight} onHeightChange={setPreviewHeight} />
          <div className="flex justify-center pb-2 gap-2">
            <RerenderButton />
            <RerenderButton isZoomReset onClick={() => previewRef.current?.resetZoom()} />
          </div>

          {/* サブタブ切り替え */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeSubTab === 'list'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveSubTab('list')}
            >
              {t('root.themes.list')}
            </button>
            {hasCustomizeOptions && (
              <button
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  activeSubTab === 'customize'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveSubTab('customize')}
              >
                {t('root.themes.customize')}
              </button>
            )}
          </div>
        </div>

        {/* テーマリスト */}
        {activeSubTab === 'list' && (
          <>
            <BlockTitle className="mt-4">{t('root.themes.list')}</BlockTitle>
            <List strongIos inset>
              {themes.map((theme, index) => (
                <ThemeListItem key={index} name={theme.name} />
              ))}
            </List>
          </>
        )}

        {/* カスタマイズ */}
        {activeSubTab === 'customize' && hasCustomizeOptions && (
          <>
            <BlockTitle className="mt-4">
              {t('root.themes.customize')}
              <ThemeOptionResetButton />
            </BlockTitle>
            <List strongIos inset>
              {theme?.options.map((option, index) => {
                return <ThemeOptionListInput {...option} key={index} />;
              })}
              <NotCroppedModeListItem />
            </List>
          </>
        )}

        <Tabbar labels={true} icons={true} className="left-0 bottom-0 fixed">
          <TabbarLink key={1} active={false} label={t('root.tab.convert')} icon={<GenerateIcon size={24} />} onClick={() => setTabIndex(0)} />
          <TabbarLink key={2} active={true} label={t('root.tab.theme-settings')} icon={<ImageIcon size={24} />} onClick={() => setTabIndex(1)} />
          <TabbarLink key={3} active={false} label={t('root.tab.export-settings')} icon={<SettingsIcon size={24} />} onClick={() => setTabIndex(2)} />
        </Tabbar>

        <Loading />
      </Page>
    );
  }

  // Desktop layout (Lightroom-style with drawer)
  return (
    <Page>
      <Navbar large transparent title={t('root.themes')} />
      
      <div className="flex" style={{ height: 'calc(100vh - env(safe-area-inset-top, 0px) - 4rem - 5rem)' }}>
        {/* Left side: Preview */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <canvas
              id="preview"
              ref={canvasRef}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                cursor: scale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
              }}
              onMouseDown={handleCanvasMouseDown}
              onTouchStart={handleCanvasTouchStart}
            />
          </div>
          <div className="flex justify-center py-3 gap-2 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <RerenderButton />
            <RerenderButton isZoomReset onClick={resetZoom} />
          </div>
        </div>

        {/* Right side: Drawer */}
        <div
          className={`bg-white dark:bg-black border-l border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col ${
            drawerOpen ? 'w-96' : 'w-0'
          } overflow-hidden`}
        >
          <div className="flex-1 overflow-y-auto">
            {/* Drawer tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-black z-10">
              <button
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  activeSubTab === 'list'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveSubTab('list')}
              >
                {t('root.themes.list')}
              </button>
              {hasCustomizeOptions && (
                <button
                  className={`flex-1 py-3 text-center font-medium transition-colors ${
                    activeSubTab === 'customize'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveSubTab('customize')}
                >
                  {t('root.themes.customize')}
                </button>
              )}
            </div>

            {/* Drawer content */}
            <div className="p-4">
              {activeSubTab === 'list' && (
                <>
                  <BlockTitle>{t('root.themes.list')}</BlockTitle>
                  <List strongIos>
                    {themes.map((theme, index) => (
                      <ThemeListItem key={index} name={theme.name} />
                    ))}
                  </List>
                </>
              )}

              {activeSubTab === 'customize' && hasCustomizeOptions && (
                <>
                  <BlockTitle>
                    {t('root.themes.customize')}
                    <ThemeOptionResetButton />
                  </BlockTitle>
                  <List strongIos>
                    {theme?.options.map((option, index) => {
                      return <ThemeOptionListInput {...option} key={index} />;
                    })}
                    <NotCroppedModeListItem />
                  </List>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Drawer toggle button */}
        <button
          className="absolute top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-l-lg shadow-lg transition-all duration-300 z-50"
          onClick={() => setDrawerOpen(!drawerOpen)}
          style={{
            right: drawerOpen ? '24rem' : '0',
          }}
        >
          <PanelLeftIcon size={24} isOpen={drawerOpen} />
        </button>
      </div>

      <Tabbar labels={true} icons={true} className="left-0 bottom-0 fixed">
        <TabbarLink key={1} active={false} label={t('root.tab.convert')} icon={<GenerateIcon size={24} />} onClick={() => setTabIndex(0)} />
        <TabbarLink key={2} active={true} label={t('root.tab.theme-settings')} icon={<ImageIcon size={24} />} onClick={() => setTabIndex(1)} />
        <TabbarLink key={3} active={false} label={t('root.tab.export-settings')} icon={<SettingsIcon size={24} />} onClick={() => setTabIndex(2)} />
      </Tabbar>

      <Loading />
    </Page>
  );
};

export default ThemeSettingsPage;
