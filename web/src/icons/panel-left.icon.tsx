import { Icon } from 'konsta/react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface PanelLeftIconProps {
  size?: number;
  isOpen?: boolean;
}

const PanelLeftIcon = ({ size, isOpen }: PanelLeftIconProps) => {
  return <Icon ios={isOpen ? <MdChevronRight size={size} /> : <MdChevronLeft size={size} />} />;
};

export default PanelLeftIcon;
