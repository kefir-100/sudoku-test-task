import { GameDifficultyLevel } from '../../models/game-difficulty-level';
import { SolveApiStatus } from '../../models/solve-api-status';
import { ValidateApiStatus } from '../../models/validate-api-status';

export const APP_CONFIG = {
  api: {
    baseUrl: 'https://sugoku.onrender.com',
    endpoints: {
      board: '/board',
      solve: '/solve',
      validate: '/validate',
    },
  },
  difficulties: [
    GameDifficultyLevel.Easy,
    GameDifficultyLevel.Medium,
    GameDifficultyLevel.Hard,
    GameDifficultyLevel.Random,
  ],
  storage: {
    gameSnapshotKey: 'sudoku-test-task:v1',
  },
  routes: {
    welcome: '',
    play: 'play',
  },
  snackbar: {
    durationMs: 6000,
    messages: {
      apiError: "Couldn't reach the Sudoku service. Please try again.",
      gameRestored: 'Your previous game was restored.',
      storageFallback: 'Storage failed.',
    },
    validateMessages: {
      [ValidateApiStatus.Solved]: 'Puzzle is solved correctly. Well done!',
      [ValidateApiStatus.Unsolved]: 'Looks good so far. Keep filling the empty cells.',
      [ValidateApiStatus.Broken]:
        'Some entries break Sudoku rules. Check the highlighted conflicts.',
    } satisfies Record<ValidateApiStatus, string>,
    solveMessages: {
      [SolveApiStatus.Solved]: 'Solver filled the remaining cells (shown in italics).',
      [SolveApiStatus.Unsolved]: "Solver couldn't finish this puzzle. Try New Game.",
      [SolveApiStatus.Broken]: 'Your current entries conflict. Clear them or try New Game.',
      [SolveApiStatus.Unsolvable]: 'No solution from this state. Try New Game.',
    } satisfies Record<SolveApiStatus, string>,
  },
  titles: {
    welcome: 'Sudoku',
    play: 'Sudoku — Play',
    notFound: 'Sudoku — Not Found',
  },
  defaults: {
    loadingIndicatorLabel: 'Loading…',
    emptyStateMessage: 'Pick a difficulty and press Start Game to begin.',
  },
  sudokuStorage: {
    storage_debounce_ms: 250,
  },
} as const;
