import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { APP_CONFIG } from '../config/app-config';
import { CURRENT_SNAPSHOT_SCHEMA_VERSION } from './game-state-storage.config';
import { GameStateStorageService } from './game-state-storage.service';
import { LocalStorageService } from './local-storage.service';
import { StorageProvider } from './storage-provider';
import type { GameSnapshot } from '../../models/game-snapshot';
import { GameDifficultyLevel } from '../../models/game-difficulty-level';
import { GameStatus } from '../../models/game-status';

const SNAPSHOT: GameSnapshot = {
  schemaVersion: CURRENT_SNAPSHOT_SCHEMA_VERSION,
  difficulty: GameDifficultyLevel.Easy,
  status: GameStatus.Playing,
  originalBoard: [[0]],
  currentBoard: [[5]],
  solverFilledCellIds: [],
};

describe('GameStateStorageService', () => {
  let service: GameStateStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameStateStorageService,
        LocalStorageService,
        { provide: StorageProvider, useExisting: LocalStorageService },
      ],
    });
    service = TestBed.inject(GameStateStorageService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('saves and loads a snapshot', () => {
    service.saveSnapshot(SNAPSHOT);
    expect(service.loadSnapshot()).toEqual(SNAPSHOT);
  });

  it('returns null when nothing is saved', () => {
    expect(service.loadSnapshot()).toBeNull();
  });

  it('rejects a snapshot with the wrong schemaVersion', () => {
    localStorage.setItem(
      APP_CONFIG.storage.gameSnapshotKey,
      JSON.stringify({ ...SNAPSHOT, schemaVersion: 99 }),
    );
    expect(service.loadSnapshot()).toBeNull();
  });

  it('clearSnapshot wipes the saved game', () => {
    service.saveSnapshot(SNAPSHOT);
    service.clearSnapshot();
    expect(service.loadSnapshot()).toBeNull();
  });
});
