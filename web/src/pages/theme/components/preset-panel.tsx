import { BlockTitle, List } from 'konsta/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import saveAs from 'file-saver';
import Preset from '../database/preset';
import type { ThemePreset } from '../types/preset';
import PresetListItem from './preset.list-item';
import PresetToolbar from './preset-toolbar';
import ExportPresetDialog from './export-preset.dialog';

interface PresetPanelProps {
  listInset: boolean;
}

const PresetPanel = ({ listInset }: PresetPanelProps) => {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<ThemePreset[]>(() => Preset.list());
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [exportOpened, setExportOpened] = useState(false);
  const [exportTargetIds, setExportTargetIds] = useState<string[] | null>(null);

  const refresh = useCallback(() => {
    setPresets(Preset.list());
  }, []);

  const handleDelete = (id: string) => {
    if (!window.confirm(t('root.themes.presets.delete-confirm'))) return;
    Preset.remove(id);
    if (selectedPresetId === id) setSelectedPresetId(null);
    refresh();
  };

  const handleExportRequest = (id: string) => {
    setExportTargetIds([id]);
    setExportOpened(true);
  };

  const handleExport = (format: 'json' | 'yaml') => {
    const targets = exportTargetIds
      ? presets.filter((preset) => exportTargetIds.includes(preset.id))
      : presets;
    if (targets.length === 0) return;

    const content = Preset.serialize(targets, format);
    const extension = format === 'yaml' ? 'yml' : 'json';
    const filename =
      targets.length === 1
        ? `exif-frame-preset-${targets[0].name.replace(/[^\w-]+/g, '_')}.${extension}`
        : `exif-frame-presets.${extension}`;
    const mime = format === 'yaml' ? 'text/yaml;charset=utf-8' : 'application/json;charset=utf-8';
    saveAs(new Blob([content], { type: mime }), filename);
    setExportTargetIds(null);
  };

  return (
    <>
      <PresetToolbar
        presets={presets}
        padded={listInset}
        onChanged={refresh}
        onExportAll={() => {
          setExportTargetIds(null);
          setExportOpened(true);
        }}
      />

      <BlockTitle className={listInset ? 'mt-2' : undefined}>{t('root.themes.presets')}</BlockTitle>
      {presets.length === 0 ? (
        <p className={`text-sm text-gray-500 dark:text-gray-400 pb-4 ${listInset ? 'px-8' : ''}`}>
          {t('root.themes.presets.empty')}
        </p>
      ) : (
        <List strongIos inset={listInset}>
          {presets.map((preset) => (
            <PresetListItem
              key={preset.id}
              preset={preset}
              selected={selectedPresetId === preset.id}
              onSelect={setSelectedPresetId}
              onDelete={handleDelete}
              onExport={handleExportRequest}
            />
          ))}
        </List>
      )}

      <ExportPresetDialog
        opened={exportOpened}
        onClose={() => {
          setExportOpened(false);
          setExportTargetIds(null);
        }}
        onExport={handleExport}
      />
    </>
  );
};

export default PresetPanel;
