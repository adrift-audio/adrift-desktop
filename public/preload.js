/* eslint-disable-next-line */
const { contextBridge } = require('electron');

const addFiles = require('./node/add-files');
const fileLoader = require('./node/file-loader');
const { seedFiles } = require('./node/torrent-services');

/**
 * @typedef {{ id: string; link: string }} Link
 * @typedef {{ id: string; path: string }} Path;
 * @typedef {{
 *  added: number;
 *  duration: number;
 *  durationLoaded: boolean;
 *  id: string;
 *  name: string;
 *  path: string;
 *  size: number;
 *  type: string;
 * }} ProcessedFile
 */

process.once(
  'loaded',
  () => {
    contextBridge.exposeInMainWorld(
      'electron',
      {
        /**
         * Handle file adding
         * @param {ProcessedFile[]} items - added items
         * @returns {Promise<ProcessedFile[] | string>}
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
         * Seed files
         * @param {Path[]} files - files to seed
         * @returns {Promise<Link[] | null>}
         */
        async seedFiles(files) {
          return seedFiles(files);
        },
      },
    );
  },
);
