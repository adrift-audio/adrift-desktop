import React, { memo, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

import log from '../../utilities/log';
// import useRefState from '../../hooks/use-ref-state';
import { WEBSOCKETS_URL } from '../../configuration';

function Home(): React.ReactElement {
  // const [socketClient, setSocketClient] = useRefState<Socket>({} as Socket);

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
  return (
    <h1>
      Home
    </h1>
  );
}

export default memo(Home);
