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
import createPlaylist from '../../utilities/create-playlist';
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
  PlaylistEntry,
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
  const [detailsModal, setDetailsModal] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [filesReady, setFilesReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [links, setLinks] = useRefState<Link[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<ProcessedFile>({} as ProcessedFile);
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

  const handleClientConnection = useCallback(
    ({ client }: EventTypes.ClientConnectionPayload): null | Socket => {
      if (!(client === CLIENT_TYPES.mobile && socketClient?.current?.connected)) {
        return null;
      }

      const playlist: PlaylistEntry[] = createPlaylist(files);
      return socketClient.current.emit(
        SOCKET_EVENTS.AVAILABLE_PLAYLIST,
        {
          issuer: CLIENT_TYPE,
          playlist,
          target: CLIENT_TYPES.mobile,
        },
      );
    },
    [files],
  );

  const handlePlayNext = useCallback(
    async ({ id, issuer, target }: EventTypes.PlayNextPayload): Promise<null | Socket> => {
      if (!(socketClient?.current?.connected && issuer === CLIENT_TYPES.mobile
        && target === CLIENT_TYPES.desktop)) {
        return null;
      }

      if (!id) {
        return socketClient.current.emit(
          SOCKET_EVENTS.ERROR,
          {
            error: 'MISSING_TRACK_ID',
            issuer: CLIENT_TYPE,
            target: CLIENT_TYPES.mobile,
          },
        );
      }

      const [track] = files.filter(
        (item: ProcessedFile): boolean => item.id === id,
      );
      const [seededLink] = links.current.filter((item: Link): boolean => item.id === id);
      let magnetLink = {} as Link;

      try {
        if (seededLink) {
          magnetLink = { ...seededLink };
        } else {
          if (!track) {
            return socketClient.current.emit(
              SOCKET_EVENTS.ERROR,
              {
                error: 'INVALID_TRACK_ID',
                issuer: CLIENT_TYPE,
                target: CLIENT_TYPES.mobile,
              },
            );
          }

          [magnetLink] = await global.electron.seedFiles([{ id: track.id, path: track.path }]);
          setLinks([
            ...links.current,
            magnetLink,
          ]);
        }

        return socketClient.current.emit(
          SOCKET_EVENTS.SWITCH_TRACK,
          {
            issuer: CLIENT_TYPE,
            link: encodeLink(magnetLink.link),
            target: CLIENT_TYPES.mobile,
            track,
          },
        );
      } catch {
        return socketClient.current.emit(
          SOCKET_EVENTS.ERROR,
          {
            error: 'INTERNAL_DESKTOP_ERROR',
            issuer: CLIENT_TYPE,
            target: CLIENT_TYPES.mobile,
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

  // handle socket connection
  useEffect(
    (): (() => void) => {
      const socketConnection: Socket = connect(token);
      setSocketClient(socketConnection);

      return (): void => {
        socketConnection.close();
        setSocketClient({} as Socket);
      };
    },
    [filesReady],
  );

  // handle socket events
  useEffect(
    (): (() => void) => {
      if (socketClient.current.connected) {
        socketClient.current.on(
          SOCKET_EVENTS.CONNECT,
          (): void => {
            const playlist: PlaylistEntry[] = createPlaylist(files);
            socketClient.current.emit(
              SOCKET_EVENTS.AVAILABLE_PLAYLIST,
              {
                issuer: CLIENT_TYPE,
                playlist,
                target: CLIENT_TYPES.mobile,
              },
            );
          },
        );

        socketClient.current.on(SOCKET_EVENTS.CLIENT_CONNECTED, handleClientConnection);
        socketClient.current.on(SOCKET_EVENTS.PLAY_NEXT, handlePlayNext);
        socketClient.current.on(SOCKET_EVENTS.REMOVE_FILE, handleRemoveFile);
      }

      return (): void => {
        if (socketClient.current.connected) {
          socketClient.current.off(SOCKET_EVENTS.CLIENT_CONNECTED, handleClientConnection);
          socketClient.current.off(SOCKET_EVENTS.PLAY_NEXT, handlePlayNext);
          socketClient.current.off(SOCKET_EVENTS.REMOVE_FILE, handleRemoveFile);
        }
      };
    },
    [
      files,
      links,
      socketClient.current,
    ],
  );

  const handleContextClick = (id: string): void => {
    log(`clicked ${id}`);
    const [selected] = files.filter((track: ProcessedFile): boolean => track.id === id);
    setSelectedTrack(selected);
    return setDetailsModal(true);
  };

  /**
   * Calculate durations of the tracks
   * @param {ProcessedFile[]} fullList - list of all of the processed files
   * @param {ProcessedFile[]} withoutDuration - list of the items that were not fully processed yet
   * @returns {Promise<void | null>}
   */
  const calculateDurations = async (
    fullList: ProcessedFile[],
    withoutDuration: ProcessedFile[],
  ): Promise<void | null> => {
    if (withoutDuration.length === 0) {
      if (socketClient?.current?.connected) {
        const playlist: PlaylistEntry[] = createPlaylist(fullList);
        socketClient.current.emit(
          SOCKET_EVENTS.AVAILABLE_PLAYLIST,
          {
            issuer: CLIENT_TYPE,
            playlist,
            target: CLIENT_TYPES.mobile,
          },
        );
      }
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
    [storeKeys.token, storeKeys.user].forEach((key) => deleteData(key));
    socketClient.current.close();
    setSettingsModal(false);
    return router.replace(ROUTES.signIn);
  };

  /**
   * Remove all seeded items
   */
  const handleRemoveAll = useCallback(
    (): void => {
      // TODO: disable seeding, notify the room
      deleteData(storeKeys.files);
      setFiles([]);
      setLinks([]);
      if (socketClient?.current?.connected) {
        socketClient.current.emit(
          SOCKET_EVENTS.REMOVE_ALL,
          {
            issuer: CLIENT_TYPE,
            target: CLIENT_TYPES.mobile,
          },
        );
      }
      return setSettingsModal(false);
    },
    [files, links],
  );

  const handleDetailsModal = () => setDetailsModal((state) => !state);

  return (
    <HomeLayout
      detailsModal={detailsModal}
      dragging={dragging}
      files={files}
      handleContextClick={handleContextClick}
      handleDetailsModal={handleDetailsModal}
      handleDrop={handleDrop}
      handleLogout={handleLogout}
      handleRemoveAll={handleRemoveAll}
      handleSettingsModal={handleSettingsModal}
      loading={loading}
      selectedTrack={selectedTrack}
      setDragging={setDragging}
      settingsModal={settingsModal}
      user={user || null}
    />
  );
}

export default memo(Home);
