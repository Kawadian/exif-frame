import { Dialog, DialogButton } from 'konsta/react';
import { useTranslation } from 'react-i18next';

interface ExportPresetDialogProps {
  opened: boolean;
  onClose: () => void;
  onExport: (format: 'json' | 'yaml') => void;
}

const ExportPresetDialog = ({ opened, onClose, onExport }: ExportPresetDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      opened={opened}
      onBackdropClick={onClose}
      title={t('root.themes.presets.export')}
      content={t('root.themes.presets.export-format')}
      buttons={
        <>
          <DialogButton onClick={onClose}>{t('close')}</DialogButton>
          <DialogButton
            onClick={() => {
              onExport('json');
              onClose();
            }}
          >
            JSON
          </DialogButton>
          <DialogButton
            strong
            onClick={() => {
              onExport('yaml');
              onClose();
            }}
          >
            YAML
          </DialogButton>
        </>
      }
    />
  );
};

export default ExportPresetDialog;
