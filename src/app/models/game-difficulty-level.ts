export const GameDifficultyLevel = {
  Easy: 'easy',
  Medium: 'medium',
  Hard: 'hard',
  Random: 'random',
} as const;

export type GameDifficultyLevel = (typeof GameDifficultyLevel)[keyof typeof GameDifficultyLevel];

export type ResolvedDifficultyLevel = Exclude<GameDifficultyLevel, 'random'>;
