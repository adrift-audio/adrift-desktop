import React, { memo } from 'react';

import '../Home.scss';

interface DropZoneProps {
  dragging: boolean;
  handleDragging: (value: boolean) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

function DropZone(props: DropZoneProps): React.ReactElement {
  const {
    dragging,
    handleDragging,
    handleDragOver,
    handleDrop,
  } = props;

  const dragEnter = () => handleDragging(true);

  const dragLeave = () => handleDragging(false);

  return (
    <div
      className={`flex mt-16 drop-zone ${dragging ? 'dragging' : ''}`}
      onDragEnter={dragEnter}
      onDragLeave={dragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    />
  );
}

export default memo(DropZone);
