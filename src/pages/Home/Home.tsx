import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { useHistory } from 'react-router-dom';

import Cog from '../../assets/cog.svg';
import combineLists from '../../utilities/combine-lists';
import DarkWave from '../../assets/wave-dark.svg';
import DropZone from './components/DropZone';
import encodeLink from '../../utilities/encode-link';
import {
  deleteData,
  getData,
  storeData,
  storeKeys,
} from '../../utilities/data-service';
import log from '../../utilities/log';
import useRefState from '../../hooks/use-ref-state';
import { PreProcessedFile, ProcessedFile, User } from '../../@types/models';
import { ROUTES, SOCKET_EVENTS } from '../../constants';
import connect from '../../utilities/socket-connection';
import SettingsModal from './components/SettingsModal';
import './Home.scss';
import { BACKEND_URL } from '../../configuration';

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
  const [settingsModal, setSettingsModal] = useState<boolean>(false);
  const [socketClient, setSocketClient] = useRefState<Socket>({} as Socket);
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<User>();

  const router = useHistory();

  // get token
  useEffect(
    (): void => {
      const existingToken = getData<string>('token');
      if (!existingToken) {
        router.replace(ROUTES.signIn);
      }
      setToken(String(existingToken));

      axios({
        headers: {
          Authorization: existingToken,
        },
        method: 'GET',
        url: `${BACKEND_URL}/api/account`,
      }).then((result) => {
        console.log(result);
        setUser(result.data.data.user);
      }).catch((error) => {
        console.log(error);
      });
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
      items.map((item: ExtendedFile): PreProcessedFile => ({
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

    console.log(fileList);
    return setFiles(fileList);
  };

  const handleSettingsModal = (): void => setSettingsModal((state): boolean => !state);

  const handleLogout = (): void => {
    // TODO: properly log out, disable seeding, close socket connection, notify the room
    deleteData(storeKeys.token);
    setSettingsModal(false);
    return router.replace(ROUTES.signIn);
  };

  const handleRemoveAll = (): void => {
    // TODO: properly remove all seeded files, disable seeding, notify the room
    deleteData(storeKeys.files);
    setFiles([]);
    return setSettingsModal(false);
  };

  return (
    <div className="flex direction-column home fade-in">
      { settingsModal && (
        <SettingsModal
          handleLogout={handleLogout}
          handleRemoveAll={handleRemoveAll}
          handleSettingsModal={handleSettingsModal}
        />
      ) }
      <div className="flex justify-content-between align-items-center header noselect">
        <button
          className="flex justify-content-between align-items-center header-icon-button"
          type="button"
        >
          <img
            alt="Adrift"
            className="header-icon"
            src={DarkWave}
          />
        </button>
        <div className="flex align-items-center">
          <span className="mr-1">
            { !user && 'Loading...' }
            { user && `${user.firstName} ${user.lastName}`}
          </span>
          <button
            className="flex justify-content-between align-items-center header-icon-button"
            onClick={handleSettingsModal}
            type="button"
          >
            <img
              alt="Settings"
              className="header-icon"
              src={Cog}
            />
          </button>
        </div>
      </div>
      <DropZone
        dragging={dragging}
        files={files}
        handleDragging={setDragging}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        loading={loading}
      />
    </div>
  );
}

export default memo(Home);
