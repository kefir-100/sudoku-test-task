import type { GameDifficultyLevel } from './game-difficulty-level';
import type { GameStatus } from './game-status';
import type { RawBoard } from './raw-board';

export interface GameSnapshot {
  readonly schemaVersion: 2;
  readonly difficulty: GameDifficultyLevel;
  readonly status: GameStatus;
  readonly originalBoard: RawBoard;
  readonly currentBoard: RawBoard;
  readonly solverFilledCellIds: readonly number[];
}
