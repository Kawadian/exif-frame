import { Icon, ListItem } from 'konsta/react';
import { useEffect, useState } from 'react';
import { IoDownloadOutline, IoTrashOutline } from 'react-icons/io5';
import { useStore } from '../../../store';
import { useThemeStore } from '../../../themes';
import { photoKeyOf } from './theme-list-preview';
import { presetListPreviewQueue } from './preset-list-preview';
import Preset from '../database/preset';
import type { ThemePreset } from '../types/preset';

interface PresetListItemProps {
  preset: ThemePreset;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

const PresetListItem = ({ preset, selected, onSelect, onDelete, onExport }: PresetListItemProps) => {
  const { photos, previewPhoto, rerenderOptions, tabIndex } = useStore();
  const { clearOption } = useThemeStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const sourcePhoto = previewPhoto || photos[0] || null;
  const sourceKey = sourcePhoto ? photoKeyOf(sourcePhoto) : null;

  useEffect(() => {
    if (!sourcePhoto || tabIndex !== 1) {
      setPreviewUrl(null);
      if (!sourcePhoto) {
        presetListPreviewQueue.invalidate();
      }
      return;
    }

    let cancelled = false;
    setPreviewUrl(null);

    presetListPreviewQueue.enqueue(
      preset.id,
      preset.themeName,
      preset.options,
      preset.notCroppedMode,
      sourcePhoto,
      (presetId, dataUrl) => {
        if (!cancelled && presetId === preset.id) {
          setPreviewUrl(dataUrl);
        }
      },
      selected
    );

    return () => {
      cancelled = true;
    };
    // Intentionally omit selected so selection stays snappy and does not re-queue previews.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset.id, preset.themeName, preset.options, preset.notCroppedMode, preset.updatedAt, sourcePhoto, sourceKey, rerenderOptions, tabIndex]);

  const handleSelect = () => {
    clearOption();
    const applied = Preset.apply(preset.id);
    if (applied) onSelect(preset.id);
  };

  return (
    <ListItem
      title={preset.name}
      subtitle={preset.themeName}
      onClick={handleSelect}
      className="cursor-pointer"
      style={{
        minHeight: '4.5rem',
        backgroundColor: selected ? 'rgba(37, 99, 235, 0.12)' : undefined,
        boxShadow: selected ? 'inset 3px 0 0 0 rgb(37, 99, 235)' : undefined,
      }}
      media={
        sourcePhoto ? (
          <div
            className="overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800 flex items-center justify-center"
            style={{ width: '4.5rem', height: '3.5rem', flexShrink: 0 }}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="" className="w-full h-full object-contain" draggable={false} />
            ) : (
              <div className="w-full h-full animate-pulse bg-gray-300 dark:bg-gray-700" />
            )}
          </div>
        ) : undefined
      }
      after={
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="p-1.5 text-blue-600 dark:text-blue-400"
            aria-label="export"
            onClick={() => onExport(preset.id)}
          >
            <Icon ios={<IoDownloadOutline className="w-5 h-5" />} />
          </button>
          <button
            type="button"
            className="p-1.5 text-red-600 dark:text-red-400"
            aria-label="delete"
            onClick={() => onDelete(preset.id)}
          >
            <Icon ios={<IoTrashOutline className="w-5 h-5" />} />
          </button>
        </div>
      }
    />
  );
};

export default PresetListItem;
