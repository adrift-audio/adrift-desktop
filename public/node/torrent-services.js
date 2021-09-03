const TorrentServer = require('./torrent-server');

/**
* @typedef {{ id: string; link: string }} Link
* @typedef {{ id: string; path: string }} Path;
 */

/**
 * Seed files
 * @param {Path[]} files - files to seed
 * @returns {Promise<Link[] | null>}
 */
const seedFiles = async (files = []) => {
  if (files.length === 0) {
    return [];
  }

  try {
    const links = await Promise.all(
      files.map(
        (file) => new Promise(
          (resolve) => TorrentServer.seed(
            file.path,
            (seededTorrent) => resolve(seededTorrent.magnetURI),
          ),
        ),
      ),
    );

    return links.map((link, i) => ({
      id: files[i].id,
      link,
    }));
  } catch {
    return [];
  }
};

module.exports = {
  seedFiles,
};
