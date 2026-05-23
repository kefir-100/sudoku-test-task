import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { APP_CONFIG } from '../config/app-config';
import { HTTP_METHOD } from '../config/http-method.config';
import { GameDifficultyLevel } from '../../models/game-difficulty-level';
import { SolveApiStatus } from '../../models/solve-api-status';
import { ValidateApiStatus } from '../../models/validate-api-status';
import { formUrlEncodedInterceptor } from './form-url-encoded.interceptor';
import { SudokuHttpClient } from './sudoku-http.client';

const BOARD_URL_HARD = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.board}?difficulty=${GameDifficultyLevel.Hard}`;
const SOLVE_URL = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.solve}`;
const VALIDATE_URL = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.validate}`;

describe('SudokuHttpClient', () => {
  let service: SudokuHttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([formUrlEncodedInterceptor])),
        provideHttpClientTesting(),
        SudokuHttpClient,
      ],
    });
    service = TestBed.inject(SudokuHttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  it('GETs /board with the given difficulty', () => {
    service.getBoard(GameDifficultyLevel.Hard).subscribe((res) => {
      expect(res.board).toEqual([[1]]);
    });
    const req = controller.expectOne(BOARD_URL_HARD);
    expect(req.request.method).toBe(HTTP_METHOD.GET);
    req.flush({ board: [[1]] });
  });

  it('POSTs /solve with form-encoded board', () => {
    service.solveBoard([[1, 2]]).subscribe();
    const req = controller.expectOne(SOLVE_URL);
    expect(req.request.method).toBe(HTTP_METHOD.POST);
    expect(req.request.body).toContain('board=%5B%5B');
    req.flush({
      status: SolveApiStatus.Solved,
      solution: [[1]],
      difficulty: GameDifficultyLevel.Easy,
    });
  });

  it('POSTs /validate', () => {
    service.validateBoard([[1]]).subscribe();
    const req = controller.expectOne(VALIDATE_URL);
    expect(req.request.method).toBe(HTTP_METHOD.POST);
    req.flush({ status: ValidateApiStatus.Broken });
  });
});
