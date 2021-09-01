/* eslint-disable-next-line */
const { contextBridge } = require('electron');

const addFiles = require('./node/add-files');
const fileLoader = require('./node/file-loader');
const { seedFile } = require('./node/torrent-services');

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
         * @param {ProcessedFile} file - file object
         * @returns {Promise<string | null>}
         */
        async seedFile(file) {
          return seedFile(file);
        },
      },
    );
  },
);
