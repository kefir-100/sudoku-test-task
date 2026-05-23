import type { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, type Observable, of } from 'rxjs';
import { ErrorHandlerService } from '../errors/error-handler.service';
import { BoardMappingService } from '../mapping/board-mapping.service';
import type { GameDifficultyLevel } from '../../models/game-difficulty-level';
import type { SolveApiResponse } from '../../models/solve-api-response';
import type { SudokuBoard } from '../../models/sudoku-board';
import type { ValidateApiResponse } from '../../models/validate-api-response';
import { type ApiResult, ApiResultFactory } from './api-result';
import { SudokuHttpClient } from './sudoku-http.client';

@Injectable({ providedIn: 'root' })
export class SudokuApiService {
  private readonly http = inject(SudokuHttpClient);
  private readonly mapper = inject(BoardMappingService);
  private readonly errors = inject(ErrorHandlerService);

  getBoard(difficulty: GameDifficultyLevel): Observable<ApiResult<SudokuBoard>> {
    return this.http.getBoard(difficulty).pipe(
      map((response) => ApiResultFactory.success(this.mapper.toUiBoard(response.board))),
      catchError((error: HttpErrorResponse) =>
        of(ApiResultFactory.failure<SudokuBoard>(this.errors.normalizeHttpError(error))),
      ),
    );
  }

  validate(board: SudokuBoard): Observable<ApiResult<ValidateApiResponse>> {
    return this.http.validateBoard(this.mapper.toWire(board)).pipe(
      map((response) => ApiResultFactory.success(response)),
      catchError((error: HttpErrorResponse) =>
        of(ApiResultFactory.failure<ValidateApiResponse>(this.errors.normalizeHttpError(error))),
      ),
    );
  }

  solve(board: SudokuBoard): Observable<ApiResult<SolveApiResponse>> {
    return this.http.solveBoard(this.mapper.toWire(board)).pipe(
      map((response) => ApiResultFactory.success(response)),
      catchError((error: HttpErrorResponse) =>
        of(ApiResultFactory.failure<SolveApiResponse>(this.errors.normalizeHttpError(error))),
      ),
    );
  }
}
