const fs = require('fs/promises');

module.exports = (path = '') => {
  if (!path) {
    return null;
  }

  return fs.readFile(path);
};
