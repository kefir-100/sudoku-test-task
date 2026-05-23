import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, filter, Subject, switchMap } from 'rxjs';
import type { ApiResult } from '../../../core/api/api-result';
import { SudokuApiService } from '../../../core/api/sudoku-api.service';
import { APP_CONFIG } from '../../../core/config/app-config';
import { BoardMappingService } from '../../../core/mapping/board-mapping.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { CURRENT_SNAPSHOT_SCHEMA_VERSION } from '../../../core/storage/game-state-storage.config';
import { GameStateStorageService } from '../../../core/storage/game-state-storage.service';
import type { GameDifficultyLevel } from '../../../models/game-difficulty-level';
import type { GameSnapshot } from '../../../models/game-snapshot';
import { GameStatus } from '../../../models/game-status';
import type { NormalizedError } from '../../../models/normalized-error';
import type { SolveApiResponse } from '../../../models/solve-api-response';
import { SolveApiStatus } from '../../../models/solve-api-status';
import type { SudokuBoard } from '../../../models/sudoku-board';
import type { ValidateApiResponse } from '../../../models/validate-api-response';
import { ValidateApiStatus } from '../../../models/validate-api-status';
import { computeConflictCellIds } from '../helpers/conflict-detection';
import { computeRelatedCellIds, computeSameNumberCellIds } from '../helpers/highlight-computation';

@Injectable({ providedIn: 'root' })
export class SudokuGameService {
  private readonly api = inject(SudokuApiService);
  private readonly mapper = inject(BoardMappingService);
  private readonly storage = inject(GameStateStorageService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _status = signal<GameStatus>(GameStatus.Idle);
  private readonly _difficulty = signal<GameDifficultyLevel | null>(null);
  private readonly _board = signal<SudokuBoard | null>(null);
  private readonly _focusedCellId = signal<number | null>(null);
  private readonly _validationResult = signal<ValidateApiStatus | null>(null);
  private readonly _solveResult = signal<SolveApiStatus | null>(null);
  private readonly _error = signal<NormalizedError | null>(null);

  private readonly startGameRequest$ = new Subject<GameDifficultyLevel>();
  private readonly validateRequest$ = new Subject<SudokuBoard>();
  private readonly solveRequest$ = new Subject<SudokuBoard>();

  readonly status = this._status.asReadonly();
  readonly difficulty = this._difficulty.asReadonly();
  readonly board = this._board.asReadonly();
  readonly focusedCellId = this._focusedCellId.asReadonly();
  readonly validationResult = this._validationResult.asReadonly();
  readonly solveResult = this._solveResult.asReadonly();
  readonly error = this._error.asReadonly();

  readonly conflictCellIds = computed(() => {
    const board = this._board();
    return board ? computeConflictCellIds(board) : new Set<number>();
  });
  readonly relatedCellIds = computed(() => {
    const board = this._board();
    return board ? computeRelatedCellIds(board, this._focusedCellId()) : new Set<number>();
  });
  readonly sameNumberCellIds = computed(() => {
    const board = this._board();
    return board ? computeSameNumberCellIds(board, this._focusedCellId()) : new Set<number>();
  });

  readonly hasUserEntries = computed(() => {
    const board = this._board();
    if (!board) {
      return false;
    }
    return board.cells.some((c) => !c.isPrefilled && c.userValue !== 0);
  });
  readonly isEditableCellFocused = computed(() => {
    const cellId = this._focusedCellId();
    const board = this._board();
    if (cellId === null || !board) {
      return false;
    }
    return board.cells[cellId]?.isPrefilled === false;
  });
  readonly canValidate = computed(
    () => this._status() === GameStatus.Playing && this.hasUserEntries(),
  );
  readonly canSolve = computed(
    () => this._status() === GameStatus.Playing && this._board() !== null,
  );

  constructor() {
    this.startGameRequest$
      .pipe(
        switchMap((difficulty) => this.api.getBoard(difficulty)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.applyStartGameResult(result));

    this.validateRequest$
      .pipe(
        switchMap((board) => this.api.validate(board)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.applyValidateResult(result));

    this.solveRequest$
      .pipe(
        switchMap((board) => this.api.solve(board)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.applySolveResult(result));

    combineLatest([
      toObservable(this._board),
      toObservable(this._difficulty),
      toObservable(this._status),
    ])
      .pipe(
        filter(
          (triple): triple is [SudokuBoard, GameDifficultyLevel, GameStatus] =>
            triple[0] !== null && triple[1] !== null,
        ),
        debounceTime(APP_CONFIG.sudokuStorage.storage_debounce_ms),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(([board, difficulty, status]) => this.saveSnapshot(board, difficulty, status));
  }

  startGame(difficulty: GameDifficultyLevel): void {
    this.storage.clearSnapshot();
    this._status.set(GameStatus.Loading);
    this._difficulty.set(difficulty);
    this._validationResult.set(null);
    this._solveResult.set(null);
    this._error.set(null);
    this._focusedCellId.set(null);
    this.startGameRequest$.next(difficulty);
  }

  enterDigit(cellId: number, digit: number): void {
    const board = this._board();
    if (!board) {
      return;
    }
    this._board.set(this.mapper.updateUserValue(board, cellId, digit));
  }

  clearCell(cellId: number): void {
    this.enterDigit(cellId, 0);
  }

  focusCell(cellId: number | null): void {
    this._focusedCellId.set(cellId);
  }

  validate(): void {
    if (!this.canValidate()) {
      return;
    }
    const board = this._board();
    if (board === null) {
      return;
    }
    this._status.set(GameStatus.Loading);
    this.validateRequest$.next(board);
  }

  solve(): void {
    if (!this.canSolve()) {
      return;
    }
    const board = this._board();
    if (board === null) {
      return;
    }
    this._status.set(GameStatus.Loading);
    this.solveRequest$.next(board);
  }

  restoreFromStorage(): void {
    const snapshot = this.storage.loadSnapshot();
    if (!snapshot) {
      return;
    }
    const original = this.mapper.toUiBoard(snapshot.originalBoard);
    const solverFilledIds = new Set(snapshot.solverFilledCellIds);
    const restored: SudokuBoard = {
      cells: original.cells.map((cell) => {
        const userValue = snapshot.currentBoard[cell.row]?.[cell.column] ?? 0;
        return { ...cell, userValue, isSolverFilled: solverFilledIds.has(cell.id) };
      }),
    };
    this._board.set(restored);
    this._difficulty.set(snapshot.difficulty);
    this._status.set(this.restoredStatusFor(snapshot.status));
    this.snackbarService.showDismissSnackbar(APP_CONFIG.snackbar.messages.gameRestored);
  }

  reset(): void {
    this._status.set(GameStatus.Idle);
    this._difficulty.set(null);
    this._board.set(null);
    this._focusedCellId.set(null);
    this._validationResult.set(null);
    this._solveResult.set(null);
    this._error.set(null);
    this.storage.clearSnapshot();
  }

  private restoredStatusFor(saved: GameStatus): GameStatus {
    if (saved === GameStatus.Finished) {
      return GameStatus.Finished;
    }
    return GameStatus.Playing;
  }

  private applyStartGameResult(result: ApiResult<SudokuBoard>): void {
    if (result.error) {
      this.handleApiFailure(result.error);
      return;
    }
    this._board.set(result.data);
    this._status.set(GameStatus.Playing);
  }

  private applyValidateResult(result: ApiResult<ValidateApiResponse>): void {
    if (result.error) {
      this.handleApiFailure(result.error);
      return;
    }
    this._validationResult.set(result.data.status);
    this._status.set(
      result.data.status === ValidateApiStatus.Solved ? GameStatus.Finished : GameStatus.Playing,
    );
    this.snackbarService.showValidationResultSnackbar(result.data.status);
  }

  private applySolveResult(result: ApiResult<SolveApiResponse>): void {
    if (result.error) {
      this.handleApiFailure(result.error);
      return;
    }
    this._solveResult.set(result.data.status);
    this.applySolveResponse(result.data);
    this.snackbarService.showSolveResultSnackbar(result.data.status);
  }

  private applySolveResponse(response: SolveApiResponse): void {
    if (response.status !== SolveApiStatus.Solved) {
      this._status.set(GameStatus.Playing);
      return;
    }
    const board = this._board();
    if (board) {
      this._board.set(this.mapper.applySolution(board, response.solution));
    }
    this._status.set(GameStatus.Finished);
  }

  private saveSnapshot(
    board: SudokuBoard,
    difficulty: GameDifficultyLevel,
    status: GameStatus,
  ): void {
    const snapshot: GameSnapshot = {
      schemaVersion: CURRENT_SNAPSHOT_SCHEMA_VERSION,
      difficulty,
      status,
      originalBoard: this.mapper.toOriginalMatrix(board),
      currentBoard: this.mapper.toWire(board),
      solverFilledCellIds: board.cells.filter((c) => c.isSolverFilled).map((c) => c.id),
    };
    this.storage.saveSnapshot(snapshot);
  }

  private handleApiFailure(error: NormalizedError): void {
    this._error.set(error);
    this._status.set(GameStatus.Error);
    this.snackbarService.showDismissSnackbar(APP_CONFIG.snackbar.messages.apiError);
  }
}
