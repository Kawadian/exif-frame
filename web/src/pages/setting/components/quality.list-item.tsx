import { ListItem, Range } from 'konsta/react';
import { useStore } from '../../../store';
import { useTranslation } from 'react-i18next';
import QualityIcon from '../../../icons/quality.icon';
import { useState, useEffect, useMemo } from 'react';
import { debounce } from '../../../utils/debounce';

const QualityListItem = () => {
  const { t } = useTranslation();
  const { quality, setQuality } = useStore();
  const [localQuality, setLocalQuality] = useState(quality);

  // Create a debounced version of setQuality
  const debouncedSetQuality = useMemo(
    () =>
      debounce((value: number) => {
        setQuality(value);
      }, 300),
    [setQuality]
  );

  // Sync local state with store when quality changes externally
  useEffect(() => {
    setLocalQuality(quality);
  }, [quality]);

  return (
    <ListItem
      title={t('root.settings.quality')}
      media={<QualityIcon size={26} />}
      after={
        <>
          {localQuality}%&nbsp;
          <Range
            value={localQuality}
            min={1}
            max={100}
            step={1}
            onChange={(e) => {
              const value = Number(e.target.value);
              setLocalQuality(value);
              debouncedSetQuality(value);
            }}
          />
        </>
      }
    />
  );
};

export default QualityListItem;
