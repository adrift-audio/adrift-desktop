import { io, Socket } from 'socket.io-client';

import { WEBSOCKETS_URL } from '../configuration';

/**
 * Create Socket.IO connection
 * @param {string} token - JWT
 * @returns {Socket}
 */
export default (token: string): Socket => {
  const connection = io(
    WEBSOCKETS_URL,
    {
      auth: {
        token,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    },
  );

  return connection;
};
