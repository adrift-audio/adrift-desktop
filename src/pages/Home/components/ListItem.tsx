import React, { memo } from 'react';

import '../Home.scss';

interface ListItemProps {
  handleContextClick: (id: string) => void;
  id: string;
  index: number;
  name: string;
}

function ListItem(props: ListItemProps): React.ReactElement {
  const {
    handleContextClick,
    id,
    index,
    name,
  } = props;

  const handleContextMenu = (): void => handleContextClick(id);

  return (
    <button
      className="flex list-item"
      onClick={handleContextMenu}
      type="button"
    >
      <span className="list-item-index">
        { index + 1 }
      </span>
      <span>
        { name }
      </span>
    </button>
  );
}

export default memo(ListItem);
