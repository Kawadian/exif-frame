import { Button } from 'konsta/react';
import { useStore } from '../../../store';
import Photo from '../../../core/photo';
import EyeIcon from '../../../icons/eye.icon';

interface PreviewPhotoButtonProps {
  photo: Photo;
}

const PreviewPhotoButton = ({ photo }: PreviewPhotoButtonProps) => {
  const { previewPhoto, setPreviewPhoto } = useStore();
  const isActive = previewPhoto === photo;

  const handleClick = () => {
    setPreviewPhoto(photo);
  };

  return (
    <Button 
      inline 
      className="w-9 h-9 flex items-center justify-center" 
      onClick={handleClick}
      colors={{ fillBgIos: isActive ? 'bg-blue-500' : 'bg-gray-200', fillBgMaterial: isActive ? 'bg-blue-500' : 'bg-gray-200' }}
    >
      <EyeIcon size={18} />
    </Button>
  );
};

export default PreviewPhotoButton;
