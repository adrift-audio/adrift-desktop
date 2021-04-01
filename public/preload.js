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
      return results;
    }

    const [target, ...rest] = directories;
    const contents = await fs.readdir(target.path);
    if (contents.length === 0) {
      return parseDirectoriesRecursively(rest, results);
    }

    const stats = await Promise.all(contents.map((item) => fs.stat(`${target.path}/${item}`)));

    // TODO: finish this
    const files = [];
    const updatedDirectories = stats.reduce(
      (array, item) => {
        if (item.isFile()) {
          // push file paths
        }
        if (item.isDirectory()) {
          // push directory path;
          array.push(item);
        }
        return array;
      },
      [],
    );

    return parseDirectoriesRecursively(
      [...rest, ...updatedDirectories],
      [...results, files],
    );
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
        /**
         * Handle file adding
         * @param {string[]} paths - paths to the dropped files
         * @returns {*[]}
         */
        async handleFileAdding(paths = []) {
          if (!(Array.isArray(paths) && paths.length > 0)) {
            return [];
          }

          try {
            const results = [];

            const filtered = paths.filter((item) => item.path);
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
