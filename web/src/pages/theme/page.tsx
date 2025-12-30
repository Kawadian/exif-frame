import { BlockTitle, List, Page, Tabbar, TabbarLink } from 'konsta/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useStore } from '../../store';
import SettingsIcon from '../../icons/settings.icon';
import ImageIcon from '../../icons/image.icon';
import GenerateIcon from '../../icons/generate.icon';
import themes from '../../themes';
import ThemeListItem from './components/theme.list-item';
import ThemeOptionListInput from './components/theme-option.list-input';
import Loading from '../convert/components/loading';
import ThemeOptionResetButton from './components/theme-option-reset.button';
import Preview, { DEFAULT_HEIGHT } from './components/preview';
import RerenderButton from './components/rerender.button';

const ThemeSettingsPage = () => {
  const { t } = useTranslation();
  const { selectedThemeName, setTabIndex } = useStore();
  const theme = themes.find((theme) => theme.name === selectedThemeName);
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'customize'>('list');
  const [previewHeight, setPreviewHeight] = useState(DEFAULT_HEIGHT);

  const hasCustomizeOptions = theme?.options && theme.options.length > 0;

  return (
    <Page style={{ paddingBottom: '10rem' }}>
      <div className="sticky top-0 z-50 bg-gray-100 dark:bg-gray-900 shadow-md">
        <Preview height={previewHeight} onHeightChange={setPreviewHeight} />
        <div className="flex justify-center pb-2">
          <RerenderButton />
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
};

export default ThemeSettingsPage;
