const { contextBridge } = require('electron');
const fs = require('fs').promises;

const pathTypes = {
  directory: 'directory',
  error: 'error',
  file: 'file',
};

process.once(
  'loaded',
  () => {
    contextBridge.exposeInMainWorld(
      'electron',
      {
        // TODO: recursive scan of all of the dropped elements
        /**
         * Determine if provided path points to the directory or file
         * @param {string} path - full path to the directory or file 
         * @returns {string}
         */
        async checkPath(path = '') {
          try {
            const stats = await fs.stat(path);
            const dir = await fs.readdir(path);
            console.log('dir:', dir);
            return stats.isDirectory() ? pathTypes.directory : pathTypes.file;
          } catch {
            return pathTypes.error;
          }
        },
      },
    );
  },
);
