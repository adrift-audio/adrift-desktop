const TorrentServer = require('./torrent-server');

/**
 * Seed file
 * @param {string} path - path to the file
 * @returns {Promise<string | null>}
 */
const seedFile = async (path = '') => {
  if (!path) {
    return null;
  }

  try {
    const seedingPromise = new Promise(
      (resolve) => TorrentServer.seed(
        path,
        (seededTorrent) => resolve(seededTorrent.magnetURI),
      ),
    );
    const resolvedLink = await seedingPromise;
    return resolvedLink;
  } catch (error) {
    return null;
  }
};

module.exports = {
  seedFile,
};
