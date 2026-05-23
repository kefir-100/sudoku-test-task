import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { APP_CONFIG } from '../config/app-config';
import { GameDifficultyLevel } from '../../models/game-difficulty-level';
import { NormalizedErrorKind } from '../../models/normalized-error';
import { SolveApiStatus } from '../../models/solve-api-status';
import type { SudokuBoard } from '../../models/sudoku-board';
import { ValidateApiStatus } from '../../models/validate-api-status';
import { formUrlEncodedInterceptor } from './form-url-encoded.interceptor';
import { SudokuApiService } from './sudoku-api.service';

const SIZE = 9;

const BOARD_URL = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.board}?difficulty=${GameDifficultyLevel.Easy}`;
const VALIDATE_URL = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.validate}`;
const SOLVE_URL = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.solve}`;

function emptyBoard(): SudokuBoard {
  return {
    cells: Array.from({ length: SIZE * SIZE }, (_, i) => ({
      id: i,
      row: Math.floor(i / SIZE),
      column: i % SIZE,
      boxIndex: Math.floor(Math.floor(i / SIZE) / 3) * 3 + Math.floor((i % SIZE) / 3),
      originalValue: 0,
      userValue: 0,
      isPrefilled: false,
      isSolverFilled: false,
    })),
  };
}

describe('SudokuApiService', () => {
  let service: SudokuApiService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([formUrlEncodedInterceptor])),
        provideHttpClientTesting(),
        SudokuApiService,
      ],
    });
    service = TestBed.inject(SudokuApiService);
    controller = TestBed.inject(HttpTestingController);
  });

  it('getBoard maps the wire response to a SudokuBoard and returns success', async () => {
    const pending = firstValueFrom(service.getBoard(GameDifficultyLevel.Easy));
    const req = controller.expectOne(BOARD_URL);
    req.flush({
      board: Array.from({ length: SIZE }, (_, r) =>
        Array.from({ length: SIZE }, (_, c) => ((r + c) % SIZE) + 1),
      ),
    });
    const result = await pending;
    if (result.error !== null) {
      throw new Error('expected success');
    }
    expect(result.data.cells.length).toBe(SIZE * SIZE);
  });

  it('getBoard normalizes HTTP errors into a failure ApiResult', async () => {
    const pending = firstValueFrom(service.getBoard(GameDifficultyLevel.Easy));
    const req = controller.expectOne(BOARD_URL);
    req.flush(null, new HttpErrorResponse({ status: 503, statusText: 'Unavailable' }));
    const result = await pending;
    if (result.error === null) {
      throw new Error('expected failure');
    }
    expect(result.error.kind).toBe(NormalizedErrorKind.Server);
  });

  it('validate returns the raw API response wrapped in success', async () => {
    const pending = firstValueFrom(service.validate(emptyBoard()));
    const req = controller.expectOne(VALIDATE_URL);
    req.flush({ status: ValidateApiStatus.Solved });
    const result = await pending;
    if (result.error !== null) {
      throw new Error('expected success');
    }
    expect(result.data.status).toBe(ValidateApiStatus.Solved);
  });

  it('solve returns the raw API response wrapped in success', async () => {
    const pending = firstValueFrom(service.solve(emptyBoard()));
    const req = controller.expectOne(SOLVE_URL);
    req.flush({
      status: SolveApiStatus.Unsolvable,
      solution: Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0)),
      difficulty: GameDifficultyLevel.Easy,
    });
    const result = await pending;
    if (result.error !== null) {
      throw new Error('expected success');
    }
    expect(result.data.status).toBe(SolveApiStatus.Unsolvable);
  });
});
