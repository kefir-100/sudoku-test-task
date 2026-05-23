import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import type { BoardApiResponse } from '../../models/board-api-response';
import type { GameDifficultyLevel } from '../../models/game-difficulty-level';
import type { RawBoard } from '../../models/raw-board';
import type { SolveApiResponse } from '../../models/solve-api-response';
import type { ValidateApiResponse } from '../../models/validate-api-response';

@Injectable({ providedIn: 'root' })
export class SudokuHttpClient {
  private readonly http = inject(HttpClient);

  getBoard(difficulty: GameDifficultyLevel): Observable<BoardApiResponse> {
    return this.http.get<BoardApiResponse>(
      `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.board}`,
      { params: new HttpParams().set('difficulty', difficulty) },
    );
  }

  solveBoard(board: RawBoard): Observable<SolveApiResponse> {
    return this.http.post<SolveApiResponse>(
      `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.solve}`,
      { board },
    );
  }

  validateBoard(board: RawBoard): Observable<ValidateApiResponse> {
    return this.http.post<ValidateApiResponse>(
      `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.validate}`,
      { board },
    );
  }
}
