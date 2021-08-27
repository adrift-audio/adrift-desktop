/* eslint-disable-next-line */
const { contextBridge } = require('electron');

const addFiles = require('./node/add-files');
const fileLoader = require('./node/file-loader');
const TorrentServer = require('./node/torrent-server');

process.once(
  'loaded',
  () => {
    contextBridge.exposeInMainWorld(
      'electron',
      {
        /**
         * Handle file adding
         * @param {ProcessedFiles[]} items - dropped items
         * @returns {Promise<object[] | string>}
         */
        async handleFileAdding(items = []) {
          if (!(Array.isArray(items) && items.length > 0)) {
            return [];
          }
          return addFiles(items);
        },
        /**
         * Load file from the disk
         * @param {string} path - path to the file
         * @returns {Promise<Buffer>}
         */
        async loadFile(path) {
          return fileLoader(path);
        },
        /**
         * Seed selected file
         * @param {object} file - file object
         * @returns {null | string}
         */
        async seedFile(file) {
          const { path = '' } = file;
          if (!path) {
            return null;
          }

          try {
            const seedingPromise = new Promise(
              (resolve) => TorrentServer.seed(
                file.path,
                (torrent) => resolve(torrent.magnetURI),
              ),
            );
            const resolvedLink = await seedingPromise;
            return resolvedLink;
          } catch {
            return null;
          }
        },
      },
    );
  },
);
