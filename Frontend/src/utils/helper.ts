export const setItem = (key: string, item: string): void => {
  if (item) {
    window.localStorage.setItem(key, item);
  } else {
    window.localStorage.removeItem(key);
  }
};

export const removeItem = (key: string): void | null => {
  if (key) {
    return window.localStorage.removeItem(key);
  }
  return null;
};

export const getItem = (key: string): string | null => {
  if (key) {
    return window.localStorage.getItem(key);
  }
  return null;
};
