const fs = require('fs/promises');

/**
 * Load file from the disk
 * @param {string} path - path to the file
 * @returns {Promise<Buffer>}
 */
module.exports = (path = '') => {
  if (!path) {
    return null;
  }

  return fs.readFile(path);
};
