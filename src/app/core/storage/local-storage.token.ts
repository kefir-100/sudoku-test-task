import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const noop = (): void => undefined;

const NOOP_STORAGE: Storage = {
  length: 0,
  clear: noop,
  getItem: (): string | null => null,
  key: (): string | null => null,
  removeItem: noop,
  setItem: noop,
};

/* SSR-safe in a Node.js environment */
export const LOCAL_STORAGE = new InjectionToken<Storage>('Local Storage', {
  providedIn: 'root',
  factory: () => (isPlatformBrowser(inject(PLATFORM_ID)) ? window.localStorage : NOOP_STORAGE),
});
