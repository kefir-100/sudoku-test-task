import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import type { GameSnapshot } from '../../models/game-snapshot';
import { CURRENT_SNAPSHOT_SCHEMA_VERSION } from './game-state-storage.config';
import { StorageProvider } from './storage-provider';

@Injectable({ providedIn: 'root' })
export class GameStateStorageService {
  private readonly storage = inject(StorageProvider);

  saveSnapshot(snapshot: GameSnapshot): void {
    this.storage.write(APP_CONFIG.storage.gameSnapshotKey, snapshot);
  }

  loadSnapshot(): GameSnapshot | null {
    const raw = this.storage.read<GameSnapshot>(APP_CONFIG.storage.gameSnapshotKey);
    if (raw === null) {
      return null;
    }
    if (raw.schemaVersion !== CURRENT_SNAPSHOT_SCHEMA_VERSION) {
      return null;
    }
    return raw;
  }

  clearSnapshot(): void {
    this.storage.remove(APP_CONFIG.storage.gameSnapshotKey);
  }
}
