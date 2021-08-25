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

  const dragEnter = (event: any) => {
    console.log('drag enter');
    event.preventDefault();
    handleDragging(true);
  };

  const dragOver = (event: any) => {
    console.log('dragOver');
    return handleDragOver(event);
  };

  const dragLeave = () => {
    console.log('drag leave');
    handleDragging(false);
  };

  return (
    <div
      className={`flex direction-column mt-16 drop-zone ${dragging ? 'dragging' : ''}`}
      onDragEnter={dragEnter}
      onDragLeave={dragLeave}
      onDragOver={dragOver}
      onDrop={handleDrop}
    >
      { loading && (
        <div>
          Loading...
        </div>
      ) }
      { files.length > 0 && !loading && !dragging && files.map((
        item: ProcessedFile,
        index: number,
      ): React.ReactElement => (
        <button
          className="flex list-item"
          key={item.path}
          onClick={() => console.log('clicked', item.name)}
          type="button"
        >
          <span className="list-item-index">
            { index + 1 }
          </span>
          <span>
            { item.name }
          </span>
        </button>
      )) }
    </div>
  );
}

export default memo(DropZone);
