import { Button, Icon } from 'konsta/react';
import { GrPowerReset } from 'react-icons/gr';
import { MdZoomOutMap } from 'react-icons/md';
import { useStore } from '../../../store';

interface RerenderButtonProps {
  isZoomReset?: boolean;
  onClick?: () => void;
}

const RerenderButton = ({ isZoomReset, onClick }: RerenderButtonProps) => {
  const { setRerenderOptions } = useStore();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setRerenderOptions();
    }
  };

  return (
    <div className="w-10">
      <Button className={isZoomReset ? 'k-color-brand-blue' : 'k-color-brand-green'} onClick={handleClick}>
        <Icon ios={isZoomReset ? <MdZoomOutMap className="w-5 h-5" /> : <GrPowerReset className="w-5 h-5" />} />
      </Button>
    </div>
  );
};

export default RerenderButton;
