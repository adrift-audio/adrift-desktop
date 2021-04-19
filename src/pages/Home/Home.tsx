import React, { memo, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import DropZone from './components/DropZone';
import log from '../../utilities/log';
// import useRefState from '../../hooks/use-ref-state';
import { WEBSOCKETS_URL } from '../../configuration';
import './Home.scss';

const global = window as any;

interface ExtendedFile extends File {
  path: string;
}

function Home(): React.ReactElement {
  // const [socketClient, setSocketClient] = useRefState<Socket>({} as Socket);
  const [dragging, setDragging] = useState<boolean>(false);

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

      return () => {
        connection.close();
      };
    },
    [],
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>): Promise<void> => {
    event.stopPropagation();
    event.preventDefault();

    setDragging(false);

    const items = Object.values(event.dataTransfer.files) as ExtendedFile[];
    const files = await global.electron.handleFileAdding(
      items.map((item: ExtendedFile) => ({
        added: Date.now(),
        name: item.name,
        path: item.path,
        size: item.size,
        type: item.type,
      })),
    );

    return console.log('in the end', files);
  };

  return (
    <>
      <h1>
        Home
      </h1>
      <DropZone
        dragging={dragging}
        handleDragging={setDragging}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
      />
    </>
  );
}

export default memo(Home);
