import type { ResolvedDifficultyLevel } from './game-difficulty-level';
import type { RawBoard } from './raw-board';
import type { SolveApiStatus } from './solve-api-status';

export interface SolveApiResponse {
  readonly status: SolveApiStatus;
  readonly solution: RawBoard;
  readonly difficulty: ResolvedDifficultyLevel;
}
