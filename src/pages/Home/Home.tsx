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
import {
  CLIENT_TYPE,
  CLIENT_TYPES,
  ROUTES,
  SOCKET_EVENTS,
} from '../../constants';
import combineLists from '../../utilities/combine-lists';
import connect from '../../utilities/socket-connection';
import {
  deleteData,
  getData,
  storeData,
  storeKeys,
} from '../../utilities/data-service';
import encodeLink from '../../utilities/encode-link';
import * as EventTypes from '../../@types/events';
import {
  ExtendedFile,
  ExtendedWindow,
  Link,
  ProcessedFile,
  User,
} from '../../@types/models';
import getDuration from '../../utilities/get-duration';
import HomeLayout from './components/HomeLayout';
import log from '../../utilities/log';
import useRefState from '../../hooks/use-ref-state';
import './Home.scss';

const global: ExtendedWindow = window as any;

function Home(): React.ReactElement {
  const [dragging, setDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [filesReady, setFilesReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [links, setLinks] = useRefState<Link[]>([]);
  const [settingsModal, setSettingsModal] = useState<boolean>(false);
  const [socketClient, setSocketClient] = useRefState<Socket>({} as Socket);
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<User>();

  const router = useHistory();

  // mounting
  useEffect(
    (): void => {
      // get token
      const existingToken = getData<string>(storeKeys.token);
      if (!existingToken) {
        router.replace(ROUTES.signIn);
      }
      setToken(String(existingToken));

      // load files
      const sharedFiles = getData<ProcessedFile[]>(storeKeys.files);
      if (Array.isArray(sharedFiles) && sharedFiles.length > 0) {
        setFiles(sharedFiles);
      }
      setFilesReady(true);

      // get user info
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

  const handleClientConnection = ({ client }: EventTypes.ClientConnectionPayload): void => {
    if (client === CLIENT_TYPES.mobile && socketClient?.current?.connected) {
      const playlist = files.map((file) => ({
        added: file.added,
        duration: file.duration,
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      socketClient.current.emit(
        SOCKET_EVENTS.AVAILABLE_PLAYLIST,
        {
          issuer: CLIENT_TYPE,
          playlist,
          target: CLIENT_TYPES.mobile,
        },
      );
    }
  };

  const handlePlayNext = useCallback(
    async ({ id }: EventTypes.PlayNextPayload): Promise<void> => {
      const [track] = files.filter(
        (item: ProcessedFile): boolean => item.id === id,
      );
      const [seededLink] = links.current.filter((item: Link): boolean => item.id === id);
      let magnetLink = {} as Link;
      if (seededLink) {
        magnetLink = { ...seededLink };
      } else {
        [magnetLink] = await global.electron.seedFiles([{ id: track.id, path: track.path }]);
        setLinks([
          ...links.current,
          magnetLink,
        ]);
      }

      if (socketClient?.current?.connected) {
        socketClient.current.emit(
          SOCKET_EVENTS.SWITCH_TRACK,
          {
            issuer: CLIENT_TYPE,
            link: encodeLink(magnetLink.link),
            target: CLIENT_TYPES.mobile,
            track,
          },
        );
      }
    },
    [files, links],
  );

  const handleRemoveFile = useCallback(
    async (payload: EventTypes.RemoveFilePayload): Promise<void | null> => {
      const { id, target } = payload;
      if (target !== CLIENT_TYPES.desktop) {
        return null;
      }

      const updatedFiles = files.filter((file: ProcessedFile): boolean => file.id !== id);
      const updatedLinks = links.current.filter((link: Link): boolean => link.id !== id);
      setFiles(updatedFiles);
      setLinks(updatedLinks);

      // TODO: stop seeding if necessary

      return storeData<ProcessedFile[]>(storeKeys.files, updatedFiles);
    },
    [files, links],
  );

  useEffect(
    (): (() => void) => {
      const socketConnection = connect(token);
      socketConnection.on(
        SOCKET_EVENTS.CONNECT,
        (): void => {
          const playlist = files.map((file) => ({
            added: file.added,
            duration: file.duration,
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
          }));
          socketConnection.emit(
            SOCKET_EVENTS.AVAILABLE_PLAYLIST,
            {
              issuer: CLIENT_TYPE,
              playlist,
              target: CLIENT_TYPES.mobile,
            },
          );

          setSocketClient(socketConnection);
        },
      );

      socketConnection.on(SOCKET_EVENTS.CLIENT_CONNECTED, handleClientConnection);
      socketConnection.on(SOCKET_EVENTS.PLAY_NEXT, handlePlayNext);
      socketConnection.on(SOCKET_EVENTS.REMOVE_FILE, handleRemoveFile);

      return (): void => {
        if (filesReady && socketConnection) {
          socketConnection.off(SOCKET_EVENTS.CLIENT_CONNECTED, handleClientConnection);
          socketConnection.off(SOCKET_EVENTS.PLAY_NEXT, handlePlayNext);
          socketConnection.off(SOCKET_EVENTS.REMOVE_FILE, handleRemoveFile);
          socketConnection.close();
        }
      };
    },
    [filesReady],
  );

  const handleContextClick = (id: string): void => log(`clicked ${id}`);

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
      return storeData<ProcessedFile[]>(storeKeys.files, fullList);
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
