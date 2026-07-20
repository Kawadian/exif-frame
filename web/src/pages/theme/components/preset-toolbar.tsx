import { Button } from 'konsta/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Preset from '../database/preset';
import type { ThemePreset } from '../types/preset';
import SavePresetDialog from './save-preset.dialog';

interface PresetToolbarProps {
  presets: ThemePreset[];
  onChanged: () => void;
  onExportAll: () => void;
  padded: boolean;
}

const PresetToolbar = ({ presets, onChanged, onExportAll, padded }: PresetToolbarProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveOpened, setSaveOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = (name: string) => {
    Preset.create(name);
    onChanged();
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const content = await file.text();
      Preset.importFromFile(content);
      onChanged();
      setError(null);
    } catch {
      setError(t('root.themes.presets.import-error'));
    }
  };

  return (
    <>
      <div className={`flex flex-wrap gap-2 py-3 ${padded ? 'px-4' : ''}`}>
        <Button className="k-color-brand-blue" small onClick={() => setSaveOpened(true)}>
          {t('root.themes.presets.save')}
        </Button>
        <Button className="k-color-brand-green" small onClick={() => fileInputRef.current?.click()}>
          {t('root.themes.presets.import')}
        </Button>
        <Button className="k-color-brand-green" small disabled={presets.length === 0} onClick={onExportAll}>
          {t('root.themes.presets.export')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.yml,.yaml,application/json,text/yaml,text/x-yaml"
          className="hidden"
          onChange={(e) => {
            void handleImportFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {error && <p className={`pb-2 text-sm text-red-600 dark:text-red-400 ${padded ? 'px-4' : ''}`}>{error}</p>}

      <SavePresetDialog opened={saveOpened} onClose={() => setSaveOpened(false)} onSave={handleSave} />
    </>
  );
};

export default PresetToolbar;
