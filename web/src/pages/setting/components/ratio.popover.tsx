import { List, ListItem, Popover } from 'konsta/react';
import { useStore } from '../../../store';
import { ASPECT_RATIO_OPTIONS } from '../../../constants/aspect-ratios';

const RatioPopover = () => {
  const { ratioPopover, setRatioPopover, setRatio } = useStore();

  return (
    <Popover opened={ratioPopover} target={'.ratio-name'} onBackdropClick={() => setRatioPopover(false)}>
      <List nested>
        {ASPECT_RATIO_OPTIONS.map((ratio) => (
          <ListItem
            key={ratio}
            title={ratio}
            link
            chevronIos={false}
            onClick={() => {
              setRatio(ratio as never);
              setRatioPopover(false);
            }}
          />
        ))}
      </List>
    </Popover>
  );
};

export default RatioPopover;
