const { deflate, inflate } = require('zlib');
const { promisify } = require('util');

/* eslint-disable */
const deflatePromise = promisify(deflate);
const inflatePromise = promisify(inflate);

module.exports = {
  compress: (buffer) => deflatePromise(buffer),
};
