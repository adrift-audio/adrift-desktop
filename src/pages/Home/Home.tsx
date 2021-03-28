import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';

import combineLists from '../../utilities/combine-lists';
import DropZone from './components/DropZone';
import encodeLink from '../../utilities/encode-link';
import { getData, storeData } from '../../utilities/data-service';
import log from '../../utilities/log';
import useRefState from '../../hooks/use-ref-state';
import { ProcessedFile } from '../../@types/models';
import { SOCKET_EVENTS } from '../../constants';
import { WEBSOCKETS_URL } from '../../configuration';
import './Home.scss';

const global = window as any;

interface ExtendedFile extends File {
  path: string;
}

function Home(): React.ReactElement {
  const [counter, setCounter] = useState<number>(10);

  const [dragging, setDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [filesReady, setFilesReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [socketClient, setSocketClient] = useRefState<Socket>({} as Socket);

  useEffect(
    (): void => {
      const sharedFiles = getData<ProcessedFile[]>('files');
      if (Array.isArray(sharedFiles) && sharedFiles.length > 0) {
        setFiles(sharedFiles);
      }
      setFilesReady(true);
    },
    [],
  );

  const handlePlayNext = useCallback(
    async (): Promise<null | void> => {
      console.log('seeding new file...', files[counter]);
      const magnetLink = await global.electron.seedFile(files[counter]);
      if (!magnetLink) {
        // TODO: error handling
        return null;
      }

      log(`magnet: ${magnetLink}`);

      const encoded = encodeLink(magnetLink);
      if (socketClient?.current?.connected) {
        socketClient.current.emit(
          SOCKET_EVENTS.SWITCH_TRACK,
          {
            link: encoded,
            track: files[counter],
          },
        );
      }

      return setCounter((state) => (state >= files.length && 0) || state + 1);
    },
    [files],
  );

  useEffect(
    () => {
      if (filesReady) {
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
        setSocketClient(connection);

        connection.on('connect', () => log(`connected ${connection.id}`));

        connection.on(SOCKET_EVENTS.PLAY_NEXT, handlePlayNext);

        return () => {
          if (filesReady && connection) {
            connection.off(SOCKET_EVENTS.PLAY_NEXT, handlePlayNext);
            connection.close();
          }
        };
      }

      return () => null;
    },
    [filesReady],
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
