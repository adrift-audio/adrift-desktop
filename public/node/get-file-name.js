/**
 * Get file name
 * @param {string} path - file path or file name
 * @returns {null | string}
 */
module.exports = (path = '') => {
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
