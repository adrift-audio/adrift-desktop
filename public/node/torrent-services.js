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
 * @param {ProcessedFile} file - processed file data
 * @returns {Promise<string | null>}
 */
const seedFile = async (file) => {
  const { torrent = '' } = file;
  if (!torrent) {
    return null;
  }

  // TODO: rewrite so that the torrent file was used for the seeding
  try {
    const seedingPromise = new Promise(
      (resolve) => TorrentServer.seed(
        file.path,
        (seededTorrent) => resolve(seededTorrent.magnetURI),
      ),
    );
    const resolvedLink = await seedingPromise;
    return resolvedLink;
  } catch {
    return null;
  }
};

module.exports = {
  initialSeeding,
  seedFile,
};
