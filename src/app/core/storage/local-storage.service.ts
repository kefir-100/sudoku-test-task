import { inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE } from './local-storage.token';
import { StorageProvider } from './storage-provider';

@Injectable({ providedIn: 'root' })
export class LocalStorageService extends StorageProvider {
  private readonly storage = inject(LOCAL_STORAGE);

  read<TValue>(key: string): TValue | null {
    try {
      const raw = this.storage.getItem(key);
      if (raw === null) {
        return null;
      }
      return JSON.parse(raw) as TValue;
    } catch {
      return null;
    }
  }

  write<TValue>(key: string, value: TValue): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }
}
