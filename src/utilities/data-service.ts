/**
 * Get data from LocalStorage
 * @param key - storage key
 * @returns {null|*}
 */
export const getData = <T>(key: string): T | null => {
  const string = localStorage.getItem(key);
  if (!string) {
    return null;
  }

  try {
    const parsed = JSON.parse(string);
    return parsed.value as T;
  } catch {
    return null;
  }
};

/**
 * Store data in LocalStorage
 * @param {string} key - storage key
 * @param {*} value - value to store
 * @returns {null|*}
 */
export const storeData = <T>(key: string, value: T): null | void => {
  try {
    const string = JSON.stringify({
      value,
    });
    return localStorage.setItem(key, string);
  } catch {
    return null;
  }
};
