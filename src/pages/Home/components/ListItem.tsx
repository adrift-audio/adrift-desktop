import React, { memo, useMemo } from 'react';

import formatDuration from '../../../utilities/format-duration';
import '../Home.scss';

interface ListItemProps {
  duration: number;
  handleContextClick: (id: string) => void;
  id: string;
  index: number;
  name: string;
  torrentCreated: boolean;
}

function ListItem(props: ListItemProps): React.ReactElement {
  const {
    duration,
    handleContextClick,
    id,
    index,
    name,
    torrentCreated,
  } = props;

  const formattedDuration = useMemo(
    (): string => formatDuration(duration),
    [duration],
  );

  return (
    <button
      className={`flex justify-content-between list-item ${
        !torrentCreated ? 'item-loading' : ''
      }`}
      onContextMenu={(): void => handleContextClick(id)}
      type="button"
    >
      <div className="flex">
        <span className="list-item-index">
          { index + 1 }
        </span>
        <span>
          { name }
        </span>
      </div>
      <span>
        { formattedDuration }
      </span>
    </button>
  );
}

export default memo(ListItem);
