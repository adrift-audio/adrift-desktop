import React, { memo } from 'react';

import { ProcessedFile } from '../../../@types/models';
import '../Home.scss';

interface DropZoneProps {
  dragging: boolean;
  files: ProcessedFile[];
  handleDragging: (value: boolean) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  loading: boolean;
}

function DropZone(props: DropZoneProps): React.ReactElement {
  const {
    dragging,
    files,
    handleDragging,
    handleDragOver,
    handleDrop,
    loading,
  } = props;

  const dragEnter = () => handleDragging(true);

  const dragLeave = () => handleDragging(false);

  return (
    <div
      className={`flex direction-column mt-16 drop-zone ${dragging ? 'dragging' : ''}`}
      onDragEnter={dragEnter}
      onDragLeave={dragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      { loading && (
        <div>
          Loading...
        </div>
      ) }
      { files.length > 0 && !loading && files.map((item: ProcessedFile): React.ReactElement => (
        <div key={item.path}>
          { item.name }
        </div>
      )) }
    </div>
  );
}

export default memo(DropZone);
