import { ListItem } from 'konsta/react';
import { useEffect, useState } from 'react';
import { useStore } from '../../../store';
import { useThemeStore } from '../../../themes';
import { photoKeyOf, themeListPreviewQueue } from './theme-list-preview';

interface ThemeListItemProps {
  name: string;
}

const ThemeListItem = ({ name }: ThemeListItemProps) => {
  const { selectedThemeName, setSelectedThemeName, photos, previewPhoto, rerenderOptions, tabIndex } = useStore();
  const { clearOption } = useThemeStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const selected = selectedThemeName === name;
  const sourcePhoto = previewPhoto || photos[0] || null;
  const sourceKey = sourcePhoto ? photoKeyOf(sourcePhoto) : null;

  useEffect(() => {
    if (!sourcePhoto || tabIndex !== 1) {
      setPreviewUrl(null);
      if (!sourcePhoto) {
        themeListPreviewQueue.invalidate();
      }
      return;
    }

    let cancelled = false;
    setPreviewUrl(null);

    themeListPreviewQueue.enqueue(
      name,
      sourcePhoto,
      (themeName, dataUrl) => {
        if (!cancelled && themeName === name) {
          setPreviewUrl(dataUrl);
        }
      },
      selectedThemeName === name
    );

    return () => {
      cancelled = true;
    };
    // Intentionally omit selectedThemeName so selection stays snappy and does not re-queue previews.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, sourcePhoto, sourceKey, rerenderOptions, tabIndex]);

  const handleSelect = () => {
    if (selected) return;
    clearOption();
    setSelectedThemeName(name);
  };

  return (
    <ListItem
      title={name}
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
              <img src={previewUrl} alt="" className="w-full h-full object-cover" draggable={false} />
            ) : (
              <div className="w-full h-full animate-pulse bg-gray-300 dark:bg-gray-700" />
            )}
          </div>
        ) : undefined
      }
    />
  );
};

export default ThemeListItem;
