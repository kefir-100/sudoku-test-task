/* Test-environment shim for `globalThis.localStorage`.

 Node 25 exposes a native `localStorage` global as a getter on `globalThis`,
 but without `--experimental-webstorage` + a real `--localstorage-file` PATH
 the getter returns a plain `{}` with none of the Storage API methods. That
 broken global shadows jsdom's working `window.localStorage`, so any spec
 calling `localStorage.clear()` throws `is not a function`.

 This module installs a deterministic in-memory `Storage` implementation
 onto `globalThis.localStorage` (and `window.localStorage` for parity), but
 ONLY when feature detection finds the resolved global to be incomplete.
 On Node ≤ 22 (jsdom's storage wins) or any future Node version that
 de-experimentalizes webstorage, this becomes a no-op. */

class InMemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

const currentGlobal = (globalThis as { localStorage?: unknown }).localStorage;
const isCompleteStorage = function (candidate: unknown): candidate is Storage {
  if (candidate === null || typeof candidate !== 'object') {
    return false;
  }
  const s = candidate as Partial<Storage>;
  return (
    typeof s.clear === 'function' &&
    typeof s.getItem === 'function' &&
    typeof s.setItem === 'function' &&
    typeof s.removeItem === 'function' &&
    typeof s.key === 'function'
  );
};

if (!isCompleteStorage(currentGlobal)) {
  const memoryStorage = new InMemoryStorage();

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: memoryStorage,
  });

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      writable: true,
      value: memoryStorage,
    });
  }
}
