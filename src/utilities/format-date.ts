import months from './months';

/**
 * Format the date
 * @param {number | string} timestamp - Unix timestamp
 * @returns {string}
 */
export default function formatDate(timestamp: number | string): string {
  if (!timestamp) {
    return '';
  }

  const numeric = Number(timestamp);
  if (Number.isNaN(numeric)) {
    return '';
  }

  const date = new Date(numeric);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  return `${months[month]} ${day}, ${year}`;
}
