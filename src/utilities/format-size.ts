function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Format file size
 * @param {number} bytes - file size in bytes
 * @returns {string}
 */
export default function formatSize(bytes: number): string {
  if (!bytes) {
    return '0 B';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${round(kilobytes).toFixed(2)} KB`;
  }

  const megabytes = kilobytes / 1024;
  return `${round(megabytes).toFixed(2)} MB`;
}
