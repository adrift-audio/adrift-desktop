import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Socket } from 'socket.io-client';
import { useHistory } from 'react-router-dom';

import combineLists from '../../utilities/combine-lists';
import DropZone from './components/DropZone';
import encodeLink from '../../utilities/encode-link';
import { getData, storeData } from '../../utilities/data-service';
import log from '../../utilities/log';
import useRefState from '../../hooks/use-ref-state';
import { ProcessedFile } from '../../@types/models';
import { ROUTES, SOCKET_EVENTS } from '../../constants';
import connect from '../../utilities/socket-connection';
import './Home.scss';

const global = window as any;

interface ExtendedFile extends File {
  path: string;
}

function Home(): React.ReactElement {
  const [counter, setCounter] = useState<number>(2);

  const [dragging, setDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [filesReady, setFilesReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [socketClient, setSocketClient] = useRefState<Socket>({} as Socket);
  const [token, setToken] = useState<string>('');

  const router = useHistory();

  // get token
  useEffect(
    (): void => {
      const existingToken = getData<string>('token');
      if (!existingToken) {
        router.replace(ROUTES.signIn);
      }
      setToken(String(existingToken));
    },
    [],
  );

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
      console.log('seeding new file...', files, counter);
      const magnetLink = await global.electron.seedFile(files[counter]);
      if (!magnetLink) {
        // TODO: error handling
        return null;
      }

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

      setCounter((state) => (state >= files.length && 0) || state + 1);
      return log(`magnet: ${magnetLink}`);
    },
    [counter, files],
  );

  useEffect(
    () => {
      const socketConnection = connect(token);

      socketConnection.on(
        SOCKET_EVENTS.CONNECT,
        (): void => {
          log(`connected ${socketConnection.id}`);
          return setSocketClient(socketConnection);
        },
      );

      socketConnection.on(SOCKET_EVENTS.PLAY_NEXT, () => {
        console.log('play next inc');
        handlePlayNext();
      });

      return () => {
        if (filesReady && socketConnection) {
          socketConnection.off(SOCKET_EVENTS.PLAY_NEXT, handlePlayNext);
          socketConnection.close();
        }
      };
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

  const testTorrent = async () => {
    const res = await global.electron.getTorrent(files[10].path);
    console.log('got res', res);
  };

  return (
    <div className="flex direction-column home fade-in">
      <DropZone
        dragging={dragging}
        files={files}
        handleDragging={setDragging}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        loading={loading}
      />
      <button
        onClick={testTorrent}
        type="button"
      >
        Test
      </button>
    </div>
  );
}

export default memo(Home);
