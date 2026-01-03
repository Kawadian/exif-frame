import { ListItem, Toggle } from 'konsta/react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../../store';
import ImageWidthIcon from '../../../icons/image-width.icon';

const NotCroppedModeListItem = () => {
  const { t } = useTranslation();
  const { notCroppedMode, setNotCroppedMode } = useStore();

  return (
    <ListItem
      media={<ImageWidthIcon size={26} />}
      title={t('root.settings.not-cropped-mode')}
      after={
        <Toggle
          checked={notCroppedMode}
          onChange={() => {
            setNotCroppedMode(!notCroppedMode);
          }}
        />
      }
    />
  );
};

export default NotCroppedModeListItem;
