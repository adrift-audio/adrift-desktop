import React, { memo } from 'react';

import ListItem from './ListItem';
import { ProcessedFile } from '../../../@types/models';
import '../Home.scss';

interface DropZoneProps {
  dragging: boolean;
  files: ProcessedFile[];
  handleContextClick: (id: string) => void;
  handleDragging: (value: boolean) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  loading: boolean;
}

function DropZone(props: DropZoneProps): React.ReactElement {
  const {
    dragging,
    files,
    handleContextClick,
    handleDragging,
    handleDragOver,
    handleDrop,
    loading,
  } = props;

  return (
    <div
      className={`flex direction-column mt-16 drop-zone ${dragging ? 'dragging' : ''}`}
      onDragEnter={(): void => handleDragging(true)}
      onDragLeave={(): void => handleDragging(false)}
      onDragOver={handleDragOver}
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
          duration={Number(item.duration)}
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
