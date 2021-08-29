const TorrentServer = require('./torrent-server');

/**
 * Seed file
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
  seedFile,
};
