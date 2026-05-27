import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// vitest 4 + jsdom 29 on Node 26 does not install Web Storage on the jsdom
// `window` — likely because Node 26's experimental top-level localStorage is
// off (`--localstorage-file` not provided), and the jsdom env defers to it.
// Install an in-memory Storage shim so `window.localStorage` works in tests.
function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
  };
}

if (typeof window !== 'undefined' && !window.localStorage) {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: createMemoryStorage(),
  });
}
if (typeof window !== 'undefined' && !window.sessionStorage) {
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: createMemoryStorage(),
  });
}

afterEach(() => {
  cleanup();
});
