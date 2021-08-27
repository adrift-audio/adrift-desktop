const getFileName = require('./get-file-name');

/**
 * Get file extension
 * @param {string} path - file path or file name
 * @returns {null | string}
 */
module.exports = (path = '') => {
  const fileName = getFileName(path);
  if (!fileName) {
    return null;
  }

  return fileName.split('.').slice(-1)[0];
};
