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
import Loading from '../convert/components/loading';
import ThemeOptionResetButton from './components/theme-option-reset.button';
import Preview, { DEFAULT_HEIGHT } from './components/preview';
import type { PreviewRef } from './components/preview';
import RerenderButton from './components/rerender.button';

const ThemeSettingsPage = () => {
  const { t } = useTranslation();
  const { selectedThemeName, setTabIndex, drawerOpen, setDrawerOpen } = useStore();
  const theme = themes.find((theme) => theme.name === selectedThemeName);
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'customize'>('list');
  const [previewHeight, setPreviewHeight] = useState(DEFAULT_HEIGHT);
  const [isMobile, setIsMobile] = useState(false);
  const previewRef = useRef<PreviewRef>(null);

  const hasCustomizeOptions = theme?.options && theme.options.length > 0;

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
      
      <div className="flex h-screen" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4rem)', paddingBottom: '5rem' }}>
        {/* Left side: Preview */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <Preview ref={previewRef} height={previewHeight} onHeightChange={setPreviewHeight} />
          </div>
          <div className="flex justify-center pb-4 gap-2">
            <RerenderButton />
            <RerenderButton isZoomReset onClick={() => previewRef.current?.resetZoom()} />
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
