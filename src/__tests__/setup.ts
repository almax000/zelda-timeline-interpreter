import '@testing-library/jest-dom';

// Ensure localStorage is properly available in jsdom
if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.setItem) {
  const store: Record<string, string> = {};
  const storage: Storage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
  Object.defineProperty(globalThis, 'localStorage', { value: storage, writable: true });
}
