import { useStore } from '../../../store';
import Photo from '../../../core/photo';
import { IoEyeOutline } from 'react-icons/io5';
import { Button, Icon } from 'konsta/react';

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
    <div className="w-10">
    <Button 
      inline 
      className="k-color-brand-blue" 
      onClick={handleClick}
      colors={{ fillBgIos: isActive ? 'bg-blue-500' : 'bg-gray-200', fillBgMaterial: isActive ? 'bg-blue-500' : 'bg-gray-200' }}
    >
      <Icon ios={<IoEyeOutline className="w-5 h-5" />} />
    </Button>
    </div>
  );
};

export default PreviewPhotoButton;
