/**
 * Encode magnet link
 * @param {string} link - magnet link
 * @returns {string}
 */
export default (link: string): null | string => {
  if (!link) {
    return null;
  }

  return btoa(link).trim();
};
