import { List, ListItem, Popover } from 'konsta/react';
import { useStore } from '../../../store';

const RatioPopover = () => {
  const { ratioPopover, setRatioPopover, setRatio } = useStore();

  // Major aspect ratios grouped by category
  const aspectRatios = [
    'free',
    '1:1',       // Square (Instagram)
    '4:5',       // Portrait (Instagram)
    '9:16',      // Vertical (Stories, Reels)
    '2:3',       // Standard portrait photography
    '3:4',       // 4:3 portrait
    '5:4',       // Traditional portrait
    '3:2',       // Classic 35mm photography
    '4:3',       // Standard display
    '16:9',      // Widescreen HD
    '16:10',     // Widescreen display
    '21:9',      // Ultra-wide cinematic
    '2.39:1',    // Anamorphic widescreen
  ];

  return (
    <Popover opened={ratioPopover} target={'.ratio-name'} onBackdropClick={() => setRatioPopover(false)}>
      <List nested>
        {aspectRatios.map((ratio) => (
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
