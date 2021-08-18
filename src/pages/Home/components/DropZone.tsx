import React, { memo } from 'react';

import ListItem from './ListItem';
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

  const handleContextClick = (id: string): void => console.log('clicked', id);

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
        <ListItem
          handleContextClick={handleContextClick}
          id={item.id}
          index={index}
          key={item.id}
          name={item.name}
        />
      )) }
    </div>
  );
}

export default memo(DropZone);
