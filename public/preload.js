const { contextBridge } = require('electron');
const fs = require('fs').promises;

// Allowed file extensions
const allowedExtensions = [
  'aac',
  'flac',
  'mp3',
];

const pathTypes = {
  directory: 'directory',
  error: 'error',
  file: 'file',
};

/**
 * Get file extension based on file path or file name
 * @param {string} path - file path or file name
 * @returns {null | string}
 */
const getFileExtension = (path = '') => {
  if (!path) {
    return null;
  }

  const fileName = path.split('/').slice(-1);
  if (!fileName.includes('.')) {
    return null;
  }

  return fileName.split('.').slice(-1);
}

const parseDirectoriesRecursively = async (directories = [], results = []) => {
  try {
    if (!(Array.isArray(directories) && directories.length > 0)) {
      return [];
    }

    const [target, ...rest] = directories;
    const contents = await fs.readdir(target.path);
    if (contents.length === 0) {
      return parseDirectoriesRecursively(rest, results);
    }

    const stats = await Promise.all(contents.map((item) => fs.stat(`${target.path}/${item}`)));

    // TODO: finish this

  } catch {
    // TODO: figure out what to return in case of an error
    return [];
  }
}

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
         * @returns {*[]}
         */
        async handleFileAdding(files = []) {
          if (!(Array.isArray(files) && files.length > 0)) {
            return [];
          }

          try {
            const results = [];

            const filtered = files.filter((item) => item.path);
            const stats = await Promise.all(filtered.map((item) => fs.stat(item.path)));

            const directories = stats.reduce(
              (array, item, i) => {
                if (item.isFile()) {
                  const extension = getFileExtension(filtered[i].path);
                  if (!(extension && allowedExtensions.includes(extension.toLowerCase()))) {
                    return array;
                  }

                  results.push(filtered[i]);
                  return array;
                }

                if (item.isDirectory()) {
                  array.push(filtered[i]);
                }

                return array;
              },
              [],
            );

            console.log('directories:', directories);
            if (directories.length > 0) {
              const parsedResults = await parseDirectoriesRecursively(directories);
              if (parsedResults.length > 0) {
                results.push(...parsedResults);
              }
            }

            return results;
          } catch {
            return pathTypes.error;
          }
        },
      },
    );
  },
);
