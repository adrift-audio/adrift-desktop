import React, { memo, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import combineLists from '../../utilities/combine-lists';
import DropZone from './components/DropZone';
import { getData, storeData } from '../../utilities/data-service';
import log from '../../utilities/log';
// import useRefState from '../../hooks/use-ref-state';
import { ProcessedFile } from '../../@types/models';
import { WEBSOCKETS_URL } from '../../configuration';
import './Home.scss';

const global = window as any;

interface ExtendedFile extends File {
  path: string;
}

function Home(): React.ReactElement {
  // const [socketClient, setSocketClient] = useRefState<Socket>({} as Socket);
  const [dragging, setDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(
    (): void => {
      const sharedFiles = getData<ProcessedFile[]>('files');
      if (Array.isArray(sharedFiles) && sharedFiles.length > 0) {
        setFiles(sharedFiles);
      }
    },
    [],
  );

  const handlePlay = () => {

  };

  useEffect(
    () => {
      const connection: Socket = io(
        WEBSOCKETS_URL,
        {
          autoConnect: true,
          // query: {
          //   token,
          // },
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 10000,
        },
      );

      // setSocketClient(connection);

      connection.on('connect', () => log(`connected ${connection.id}`));

      connection.on('PLAY', handlePlay);

      return () => {
        connection.off('PLAY', handlePlay);
        connection.close();
      };
    },
    [],
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();

  /**
   * Handle file drop
   * @param {React.DragEvent<HTMLDivElement>} event - drop event
   * @returns {Promise<void>}
   */
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>): Promise<void> => {
    event.stopPropagation();
    event.preventDefault();

    setDragging(false);
    setLoading(true);

    const items = Object.values(event.dataTransfer.files) as ExtendedFile[];
    const processedFiles: ProcessedFile[] = await global.electron.handleFileAdding(
      items.map((item: ExtendedFile): ProcessedFile => ({
        added: Date.now(),
        name: item.name,
        path: item.path,
        size: item.size,
        type: item.type,
      })),
    );

    const fileList = combineLists(files, processedFiles);
    storeData('files', fileList);
    setLoading(false);

    return setFiles(fileList);
  };

  return (
    <>
      <h1>
        Home
      </h1>
      <DropZone
        dragging={dragging}
        files={files}
        handleDragging={setDragging}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        loading={loading}
      />
    </>
  );
}

export default memo(Home);
