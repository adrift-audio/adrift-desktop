import React, { memo, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import log from '../../utilities/log';
// import useRefState from '../../hooks/use-ref-state';
import { WEBSOCKETS_URL } from '../../configuration';
import './Home.scss';

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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();

    setDragging(false);

    return console.log('dropped', event);
  };

  return (
    <>
      <h1>
        Home
      </h1>
      <div
        className={`flex mt-16 drop-zone ${dragging ? 'dragging' : ''}`}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        Drop zone
      </div>
    </>
  );
}

export default memo(Home);
