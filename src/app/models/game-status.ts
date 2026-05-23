export const GameStatus = {
  Idle: 'idle',
  Loading: 'loading',
  Playing: 'playing',
  Finished: 'finished',
  Error: 'error',
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];
