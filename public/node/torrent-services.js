const lz = require('lz-string');

const TorrentServer = require('./torrent-server');

/**
 * Create .torrent file for the initial seeding
 * @param {string} path - path to file
 * @returns {Promise<string>}
 */
const initialSeeding = async (path = '') => {
  try {
    const torrentFilePromise = new Promise(
      (resolve) => TorrentServer.seed(
        path,
        (result) => resolve(result.torrentFile),
      ),
    );
    const resolved = await torrentFilePromise;
    return lz.compress(resolved.toString('hex'));
  } catch {
    return '';
  }
};

/**
 * Seed existing .torrent file
 * @param {string} torrent - compressed .torrent file in a string format
 * @returns {Promise<string | null>}
 */
const seedFile = async (torrent = '') => {
  if (!torrent) {
    return null;
  }

  const buffer = Buffer.from(lz.decompress(torrent), 'hex');
  try {
    const seedingPromise = new Promise(
      (resolve) => TorrentServer.seed(
        buffer,
        (seededTorrent) => resolve(seededTorrent.magnetURI),
      ),
    );
    const resolvedLink = await seedingPromise;
    return resolvedLink;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  initialSeeding,
  seedFile,
};
