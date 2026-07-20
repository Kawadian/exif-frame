import { Dialog, DialogButton, List, ListInput } from 'konsta/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../../store';

interface SavePresetDialogProps {
  opened: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const SavePresetDialog = ({ opened, onClose, onSave }: SavePresetDialogProps) => {
  const { t } = useTranslation();
  const { selectedThemeName } = useStore();
  const [name, setName] = useState(selectedThemeName);

  useEffect(() => {
    if (opened) {
      setName(selectedThemeName);
    }
  }, [opened, selectedThemeName]);

  return (
    <Dialog
      opened={opened}
      onBackdropClick={onClose}
      title={t('root.themes.presets.save')}
      content={
        <List strongIos>
          <ListInput
            label={t('root.themes.presets.name')}
            type="text"
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
            placeholder={selectedThemeName}
          />
        </List>
      }
      buttons={
        <>
          <DialogButton onClick={onClose}>{t('close')}</DialogButton>
          <DialogButton
            strong
            onClick={() => {
              onSave(name.trim() || selectedThemeName);
              onClose();
            }}
          >
            {t('root.themes.presets.save')}
          </DialogButton>
        </>
      }
    />
  );
};

export default SavePresetDialog;
