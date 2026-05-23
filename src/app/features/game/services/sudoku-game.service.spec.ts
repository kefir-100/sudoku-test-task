import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_CONFIG } from '../../../core/config/app-config';
import { formUrlEncodedInterceptor } from '../../../core/api/form-url-encoded.interceptor';
import { CURRENT_SNAPSHOT_SCHEMA_VERSION } from '../../../core/storage/game-state-storage.config';
import { LocalStorageService } from '../../../core/storage/local-storage.service';
import { StorageProvider } from '../../../core/storage/storage-provider';
import { GameDifficultyLevel } from '../../../models/game-difficulty-level';
import { GameStatus } from '../../../models/game-status';
import { SolveApiStatus } from '../../../models/solve-api-status';
import { ValidateApiStatus } from '../../../models/validate-api-status';
import { SudokuGameService } from './sudoku-game.service';

describe('SudokuGameService', () => {
  let store: SudokuGameService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([formUrlEncodedInterceptor])),
        provideHttpClientTesting(),
        LocalStorageService,
        { provide: StorageProvider, useExisting: LocalStorageService },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        SudokuGameService,
      ],
    });
    store = TestBed.inject(SudokuGameService);
    controller = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('starts in idle state', () => {
    expect(store.status()).toBe(GameStatus.Idle);
    expect(store.board()).toBeNull();
  });

  it('startGame fetches board and transitions to playing', () => {
    store.startGame(GameDifficultyLevel.Easy);
    expect(store.status()).toBe(GameStatus.Loading);
    const req = controller.expectOne(
      `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.board}?difficulty=${GameDifficultyLevel.Easy}`,
    );
    req.flush({
      board: Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => ((r + c) % 9) + 1),
      ),
    });
    expect(store.status()).toBe(GameStatus.Playing);
    expect(store.board()?.cells.length).toBe(81);
    expect(store.difficulty()).toBe(GameDifficultyLevel.Easy);
  });

  it('enterDigit ignores prefilled cells', () => {
    seedBoard(store, controller);
    const prefilledId = store.board()?.cells.find((c) => c.isPrefilled)?.id ?? 0;
    store.enterDigit(prefilledId, 9);
    const cell = store.board()?.cells.find((c) => c.id === prefilledId);
    expect(cell?.userValue).not.toBe(9);
  });

  it('enterDigit on an empty cell updates state and persists snapshot', async () => {
    vi.useFakeTimers();
    try {
      seedBoard(store, controller);
      const emptyId = store.board()?.cells.find((c) => !c.isPrefilled)?.id ?? 0;
      store.enterDigit(emptyId, 7);
      expect(store.board()?.cells.find((c) => c.id === emptyId)?.userValue).toBe(7);
      expect(store.hasUserEntries()).toBe(true);
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(APP_CONFIG.sudokuStorage.storage_debounce_ms + 1);
      expect(localStorage.getItem(APP_CONFIG.storage.gameSnapshotKey)).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('canValidate is false until user enters at least one digit', () => {
    seedBoard(store, controller);
    expect(store.canValidate()).toBe(false);
    const emptyId = store.board()?.cells.find((c) => !c.isPrefilled)?.id ?? 0;
    store.enterDigit(emptyId, 5);
    expect(store.canValidate()).toBe(true);
  });

  it('isEditableCellFocused is false when no cell is focused', () => {
    seedBoard(store, controller);
    expect(store.focusedCellId()).toBeNull();
    expect(store.isEditableCellFocused()).toBe(false);
  });

  it('isEditableCellFocused is false when the focused cell is prefilled', () => {
    seedBoard(store, controller);
    const prefilledId = store.board()?.cells.find((c) => c.isPrefilled)?.id ?? 0;
    store.focusCell(prefilledId);
    expect(store.isEditableCellFocused()).toBe(false);
  });

  it('isEditableCellFocused is true when an editable cell is focused', () => {
    seedBoard(store, controller);
    const emptyId = store.board()?.cells.find((c) => !c.isPrefilled)?.id ?? 0;
    store.focusCell(emptyId);
    expect(store.isEditableCellFocused()).toBe(true);
  });

  it('isEditableCellFocused is false when there is no board even if a cellId is set', () => {
    store.focusCell(5);
    expect(store.board()).toBeNull();
    expect(store.isEditableCellFocused()).toBe(false);
  });

  it('validate POSTs and updates validationResult', () => {
    seedBoard(store, controller);
    const emptyId = store.board()?.cells.find((c) => !c.isPrefilled)?.id ?? 3;
    store.enterDigit(emptyId, 5);
    store.validate();
    const req = controller.expectOne(
      `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.validate}`,
    );
    req.flush({ status: ValidateApiStatus.Broken });
    expect(store.validationResult()).toBe(ValidateApiStatus.Broken);
  });

  it('solve applies solution and marks status finished', () => {
    seedBoard(store, controller);
    store.solve();
    const req = controller.expectOne(`${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.solve}`);
    const solution = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ((r + c) % 9) + 1),
    );
    req.flush({
      status: SolveApiStatus.Solved,
      solution,
      difficulty: GameDifficultyLevel.Easy,
    });
    expect(store.status()).toBe(GameStatus.Finished);
    expect(store.solveResult()).toBe(SolveApiStatus.Solved);
  });

  it('solve with Unsolvable response keeps status Playing and records the result', () => {
    seedBoard(store, controller);
    store.solve();
    const req = controller.expectOne(`${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.solve}`);
    req.flush({
      status: SolveApiStatus.Unsolvable,
      solution: Array.from({ length: 9 }, () => Array<number>(9).fill(0)),
      difficulty: GameDifficultyLevel.Easy,
    });
    expect(store.solveResult()).toBe(SolveApiStatus.Unsolvable);
    expect(store.status()).toBe(GameStatus.Playing);
  });

  it('rapid edits within the debounce window collapse to a single snapshot write', async () => {
    vi.useFakeTimers();
    try {
      seedBoard(store, controller);
      const emptyId = store.board()?.cells.find((c) => !c.isPrefilled)?.id ?? 0;
      store.enterDigit(emptyId, 1);
      store.enterDigit(emptyId, 2);
      store.enterDigit(emptyId, 3);
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(APP_CONFIG.sudokuStorage.storage_debounce_ms + 1);
      const persisted = localStorage.getItem(APP_CONFIG.storage.gameSnapshotKey);
      expect(persisted).not.toBeNull();
      const parsed = JSON.parse(persisted ?? '{}') as { currentBoard: number[][] };
      const row = Math.floor(emptyId / 9);
      const col = emptyId % 9;
      expect(parsed.currentBoard[row]?.[col]).toBe(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reset clears all state and the persisted snapshot', () => {
    seedBoard(store, controller);
    const emptyId = store.board()?.cells.find((c) => !c.isPrefilled)?.id ?? 0;
    store.enterDigit(emptyId, 5);
    store.reset();
    expect(store.status()).toBe(GameStatus.Idle);
    expect(store.board()).toBeNull();
    expect(store.difficulty()).toBeNull();
  });

  it('restoreFromStorage rehydrates a saved game', () => {
    localStorage.setItem(
      APP_CONFIG.storage.gameSnapshotKey,
      JSON.stringify({
        schemaVersion: CURRENT_SNAPSHOT_SCHEMA_VERSION,
        difficulty: GameDifficultyLevel.Easy,
        status: GameStatus.Playing,
        originalBoard: Array.from({ length: 9 }, () => Array<number>(9).fill(0)),
        currentBoard: Array.from({ length: 9 }, () => Array<number>(9).fill(0)),
        solverFilledCellIds: [],
      }),
    );
    store.restoreFromStorage();
    expect(store.board()).not.toBeNull();
    expect(store.difficulty()).toBe(GameDifficultyLevel.Easy);
  });

  it('restoreFromStorage preserves Finished status and isSolverFilled flags', () => {
    localStorage.setItem(
      APP_CONFIG.storage.gameSnapshotKey,
      JSON.stringify({
        schemaVersion: CURRENT_SNAPSHOT_SCHEMA_VERSION,
        difficulty: GameDifficultyLevel.Easy,
        status: GameStatus.Finished,
        originalBoard: Array.from({ length: 9 }, () => Array<number>(9).fill(0)),
        currentBoard: Array.from({ length: 9 }, () => Array<number>(9).fill(0)),
        solverFilledCellIds: [0, 1, 2],
      }),
    );
    store.restoreFromStorage();
    expect(store.status()).toBe(GameStatus.Finished);
    const board = store.board();
    expect(board?.cells.find((c) => c.id === 0)?.isSolverFilled).toBe(true);
    expect(board?.cells.find((c) => c.id === 5)?.isSolverFilled).toBe(false);
  });

  it('validate failure sets error and transitions to Error status', () => {
    seedBoard(store, controller);
    const emptyId = store.board()?.cells.find((c) => !c.isPrefilled)?.id ?? 0;
    store.enterDigit(emptyId, 5);
    store.validate();
    const req = controller.expectOne(
      `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.validate}`,
    );
    req.flush(null, new HttpErrorResponse({ status: 503, statusText: 'Unavailable' }));
    expect(store.status()).toBe(GameStatus.Error);
    expect(store.error()).not.toBeNull();
  });

  it('solve failure sets error and transitions to Error status', () => {
    seedBoard(store, controller);
    store.solve();
    const req = controller.expectOne(`${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.solve}`);
    req.flush(null, new HttpErrorResponse({ status: 500, statusText: 'Boom' }));
    expect(store.status()).toBe(GameStatus.Error);
    expect(store.error()).not.toBeNull();
  });
});

function seedBoard(store: SudokuGameService, controller: HttpTestingController): void {
  store.startGame(GameDifficultyLevel.Easy);
  const req = controller.expectOne(
    `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.board}?difficulty=${GameDifficultyLevel.Easy}`,
  );
  req.flush({
    board: Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => (r === 0 && c < 3 ? c + 1 : 0)),
    ),
  });
}
