import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formUrlEncodedInterceptor } from '../../../../core/api/form-url-encoded.interceptor';
import { LocalStorageService } from '../../../../core/storage/local-storage.service';
import { StorageProvider } from '../../../../core/storage/storage-provider';
import { APP_CONFIG } from '../../../../core/config/app-config';
import { GameDifficultyLevel } from '../../../../models/game-difficulty-level';
import { SudokuGameService } from '../../services/sudoku-game.service';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GamePageComponent],
      providers: [
        provideHttpClient(withInterceptors([formUrlEncodedInterceptor])),
        provideHttpClientTesting(),
        LocalStorageService,
        { provide: StorageProvider, useExisting: LocalStorageService },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    });
    localStorage.clear();
  });

  it('renders the empty state initially', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.textContent).toContain(APP_CONFIG.defaults.emptyStateMessage);
  });

  it('onDifficultyChanged updates the selected difficulty', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    fixture.componentInstance.onDifficultyChanged(GameDifficultyLevel.Hard);
    expect(fixture.componentInstance.selectedDifficulty).toBe(GameDifficultyLevel.Hard);
  });

  it('onStartGame delegates the current difficulty to the store', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const startSpy = vi.spyOn(store, 'startGame').mockImplementation(() => undefined);
    fixture.componentInstance.selectedDifficulty = GameDifficultyLevel.Medium;
    fixture.componentInstance.onStartGame();
    expect(startSpy).toHaveBeenCalledWith(GameDifficultyLevel.Medium);
  });

  it('onDigitEntered forwards cellId and digit to the store', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const enterDigitSpy = vi.spyOn(store, 'enterDigit').mockImplementation(() => undefined);
    fixture.componentInstance.onDigitEntered({ cellId: 42, digit: 7 });
    expect(enterDigitSpy).toHaveBeenCalledWith(42, 7);
  });

  it('onCellCleared forwards cellId to the store', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const clearCellSpy = vi.spyOn(store, 'clearCell').mockImplementation(() => undefined);
    fixture.componentInstance.onCellCleared(13);
    expect(clearCellSpy).toHaveBeenCalledWith(13);
  });

  it('onCellFocused forwards cellId to the store', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const focusCellSpy = vi.spyOn(store, 'focusCell').mockImplementation(() => undefined);
    fixture.componentInstance.onCellFocused(80);
    expect(focusCellSpy).toHaveBeenCalledWith(80);
  });

  it('renders the loading indicator while a board fetch is in flight', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    store.startGame(GameDifficultyLevel.Easy);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.querySelector('app-loading-indicator')).not.toBeNull();
    const controller = TestBed.inject(HttpTestingController);
    controller.expectOne(
      `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.board}?difficulty=${GameDifficultyLevel.Easy}`,
    );
  });

  it('renders the board after a successful fetch', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const controller = TestBed.inject(HttpTestingController);
    store.startGame(GameDifficultyLevel.Easy);
    const req = controller.expectOne(
      `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.board}?difficulty=${GameDifficultyLevel.Easy}`,
    );
    req.flush({
      board: Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => ((r + c) % 9) + 1),
      ),
    });
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.querySelector('app-sudoku-board')).not.toBeNull();
  });

  it('renders the error state when the board fetch fails', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const controller = TestBed.inject(HttpTestingController);
    store.startGame(GameDifficultyLevel.Easy);
    const req = controller.expectOne(
      `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.board}?difficulty=${GameDifficultyLevel.Easy}`,
    );
    req.flush(null, new HttpErrorResponse({ status: 500, statusText: 'Server Error' }));
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.querySelector('app-error-state')).not.toBeNull();
  });

  it('renders the numpad', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.querySelector('app-numpad')).not.toBeNull();
  });

  it('onNumpadDigit forwards the digit to enterDigit with the focused cellId', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const enterDigitSpy = vi.spyOn(store, 'enterDigit').mockImplementation(() => undefined);
    store.focusCell(42);
    fixture.componentInstance.onNumpadDigit(7);
    expect(enterDigitSpy).toHaveBeenCalledWith(42, 7);
  });

  it('onNumpadDigit is a no-op when no cell is focused', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const enterDigitSpy = vi.spyOn(store, 'enterDigit').mockImplementation(() => undefined);
    store.focusCell(null);
    fixture.componentInstance.onNumpadDigit(7);
    expect(enterDigitSpy).not.toHaveBeenCalled();
  });

  it('onNumpadClear forwards the focused cellId to clearCell', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const clearCellSpy = vi.spyOn(store, 'clearCell').mockImplementation(() => undefined);
    store.focusCell(13);
    fixture.componentInstance.onNumpadClear();
    expect(clearCellSpy).toHaveBeenCalledWith(13);
  });

  it('onNumpadClear is a no-op when no cell is focused', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const clearCellSpy = vi.spyOn(store, 'clearCell').mockImplementation(() => undefined);
    store.focusCell(null);
    fixture.componentInstance.onNumpadClear();
    expect(clearCellSpy).not.toHaveBeenCalled();
  });

  it('onValidate delegates to the store', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const validateSpy = vi.spyOn(store, 'validate').mockImplementation(() => undefined);
    fixture.componentInstance.onValidate();
    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  it('onSolve delegates to the store', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(SudokuGameService);
    const solveSpy = vi.spyOn(store, 'solve').mockImplementation(() => undefined);
    fixture.componentInstance.onSolve();
    expect(solveSpy).toHaveBeenCalledTimes(1);
  });
});
