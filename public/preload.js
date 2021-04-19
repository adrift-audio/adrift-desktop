/* eslint-disable-next-line */
const { contextBridge } = require('electron');
const fs = require('fs').promises;
const mimeTypes = require('mime-types');

// Allowed file extensions
const allowedExtensions = [
  'aac',
  'flac',
  'mp3',
];

// Custom error message as a return value for the recursive parser
const errorMessage = 'error';

/**
 * Get file name
 * @param {string} path - file path or file name
 * @returns {null | string}
 */
const getFileName = (path = '') => {
  if (!path) {
    return null;
  }

  const [fileName] = path.split('/').slice(-1);
  if (!(fileName && fileName.includes('.'))) {
    return null;
  }

  const partials = fileName.split('.');
  if (partials[0] === '' && partials.length === 2) {
    return null;
  }

  return fileName;
};

/**
 * Get file extension
 * @param {string} path - file path or file name
 * @returns {null | string}
 */
const getFileExtension = (path = '') => {
  const fileName = getFileName(path);
  if (!fileName) {
    return null;
  }

  return fileName.split('.').slice(-1)[0];
};

/**
 * Parse directories recursively to get files
 * @param {string[]} paths - array of paths
 * @param {object[]} results - array of results with file infomration
 * @returns {Promise<object[] | string>}
 */
const parseDirectoriesRecursively = async (paths = [], results = []) => {
  try {
    if (!(Array.isArray(paths) && paths.length > 0)) {
      return results;
    }

    const [target, ...rest] = paths;
    const contents = await fs.readdir(target);
    if (contents.length === 0) {
      if (rest.length > 0) {
        return parseDirectoriesRecursively(rest, results);
      }
      return results;
    }

    const stats = await Promise.all(
      contents.map((item) => fs.stat(`${target}/${item}`)),
    );

    const files = [];
    const updatedDirectories = stats.reduce(
      (array, item, i) => {
        const path = `${target}/${contents[i]}`;
        if (item.isFile()) {
          const name = getFileName(path);
          const extension = getFileExtension(path);
          if (!(name && extension && allowedExtensions.includes(extension.toLowerCase()))) {
            return array;
          }

          files.push({
            added: Date.now(),
            name,
            path,
            size: item.size,
            type: mimeTypes.contentType(extension),
          });

          return array;
        }
        if (item.isDirectory()) {
          array.push(path);
        }
        return array;
      },
      [],
    );

    return parseDirectoriesRecursively(
      [...rest, ...updatedDirectories],
      [...results, ...files],
    );
  } catch {
    return errorMessage;
  }
};

process.once(
  'loaded',
  () => {
    contextBridge.exposeInMainWorld(
      'electron',
      {
        /**
         * Handle file adding
         * @param {object[]} items - dropped items
         * @returns {Promise<object[] | string>}
         */
        async handleFileAdding(items = []) {
          if (!(Array.isArray(items) && items.length > 0)) {
            return [];
          }

          try {
            const results = [];

            const filtered = items.filter((item) => item.path);
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
                  array.push(filtered[i].path);
                }

                return array;
              },
              [],
            );

            if (directories.length > 0) {
              const parsedResults = await parseDirectoriesRecursively(directories);
              if (parsedResults.length > 0) {
                results.push(...parsedResults);
              }
            }

            return results;
          } catch {
            return errorMessage;
          }
        },
      },
    );
  },
);
