import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { useHistory } from 'react-router-dom';

import { BACKEND_URL } from '../../configuration';
import combineLists from '../../utilities/combine-lists';
import connect from '../../utilities/socket-connection';
import encodeLink from '../../utilities/encode-link';
import {
  deleteData,
  getData,
  storeData,
  storeKeys,
} from '../../utilities/data-service';
import {
  ExtendedFile,
  ProcessedFile,
  User,
} from '../../@types/models';
import getDuration from '../../utilities/get-duration';
import HomeLayout from './components/HomeLayout';
import log from '../../utilities/log';
import { ROUTES, SOCKET_EVENTS } from '../../constants';
import useRefState from '../../hooks/use-ref-state';
import './Home.scss';

const global = window as any;

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

  // get token & load user record
  useEffect(
    (): void => {
      const existingToken = getData<string>('token');
      if (!existingToken) {
        router.replace(ROUTES.signIn);
      }

      setToken(String(existingToken));

      (async () => {
        try {
          const response = await axios({
            headers: {
              Authorization: existingToken,
            },
            method: 'GET',
            url: `${BACKEND_URL}/api/account`,
          });

          const { data: { data: { user: userData = {} as User } = {} } = {} } = response;
          setUser(userData);
        } catch (error) {
          // TODO: error handling
          log(error);
        }
      })();
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
      log(`seeding new file... ${files} ${counter}`);
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

  const handleContextClick = (id: string): void => log(`clicked ${id}`);

  /**
   * Add .torrent files recursively
   * @param {ProcessedFile[]} fullList - list of all of the processed files
   * @param {ProcessedFile[]} withoutTorrent - list of the items that were not processed yet
   * @returns {Promise<void | null>}
   */
  const addTorrents = async (
    fullList: ProcessedFile[],
    withoutTorrent: ProcessedFile[],
  ): Promise<void | null> => {
    if (withoutTorrent.length === 0) {
      return storeData<ProcessedFile[]>(storeKeys.files, fullList);
    }

    const [item, ...rest] = withoutTorrent;
    const torrent = await global.electron.createTorrent(item.path);
    const updatedFullList = fullList.map((
      file: ProcessedFile,
    ): ProcessedFile => (file.id === item.id && ({
      ...file,
      torrent,
      torrentCreated: true,
    })) || file);

    setFiles(updatedFullList);
    return addTorrents(updatedFullList, rest);
  };

  /**
   * Calculate durations of the tracks
   * @param {ProcessedFile[]} fullList - list of all of the processed files
   * @param {ProcessedFile[]} withoutDuration - list of the items that were not processed yet
   * @returns {Promise<void | null>}
   */
  const calculateDurations = async (
    fullList: ProcessedFile[],
    withoutDuration: ProcessedFile[],
  ): Promise<void | null> => {
    if (withoutDuration.length === 0) {
      storeData<ProcessedFile[]>(storeKeys.files, fullList);
      const withoutTorrent = fullList.filter(({ torrentCreated }): boolean => !torrentCreated);
      return addTorrents(fullList, withoutTorrent);
    }

    const [item, ...rest] = withoutDuration;
    const duration = await getDuration(item.path, item.type);
    const updatedFullList = fullList.map((
      file: ProcessedFile,
    ): ProcessedFile => (file.id === item.id && ({
      ...file,
      duration,
      durationLoaded: true,
    })) || file);

    setFiles(updatedFullList);
    return calculateDurations(updatedFullList, rest);
  };

  /**
   * Handle file drop
   * @param {React.DragEvent<HTMLDivElement>} event - drop event
   * @returns {Promise<void>}
   */
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>): Promise<void | null> => {
    event.stopPropagation();
    event.preventDefault();

    setDragging(false);
    setLoading(true);

    const items = Object.values(event.dataTransfer.files) as ExtendedFile[];

    const preProcessed: ProcessedFile[] = items.map((item: ExtendedFile): ProcessedFile => ({
      added: Date.now(),
      duration: 0,
      durationLoaded: false,
      id: '',
      name: item.name,
      path: item.path,
      size: item.size,
      torrent: '',
      torrentCreated: false,
      type: item.type,
    }));
    const processedFiles: ProcessedFile[] = await global.electron.handleFileAdding(preProcessed);

    const fileList = combineLists(files, processedFiles);
    setFiles(fileList);
    storeData(storeKeys.files, fileList);
    setLoading(false);

    const withoutDuration = fileList.filter(({ durationLoaded }): boolean => !durationLoaded);
    return calculateDurations(fileList, withoutDuration);
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
    <HomeLayout
      dragging={dragging}
      files={files}
      handleContextClick={handleContextClick}
      handleDrop={handleDrop}
      handleLogout={handleLogout}
      handleRemoveAll={handleRemoveAll}
      handleSettingsModal={handleSettingsModal}
      loading={loading}
      setDragging={setDragging}
      settingsModal={settingsModal}
      user={user || null}
    />
  );
}

export default memo(Home);
