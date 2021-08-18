/**
 * Delete data from LocalStorage
 * @param {string} key - storage key
 * @returns {void}
 */
export const deleteData = (key: string): void => localStorage.removeItem(key);

/**
 * Get data from LocalStorage
 * @param {string} key - storage key
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
 * @returns {null|void}
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

// Store key names
export const storeKeys = {
  files: 'files',
  token: 'token',
  user: 'user',
} as const;
