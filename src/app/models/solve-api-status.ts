export const SolveApiStatus = {
  Solved: 'solved',
  Unsolved: 'unsolved',
  Broken: 'broken',
  Unsolvable: 'unsolvable',
} as const;

export type SolveApiStatus = (typeof SolveApiStatus)[keyof typeof SolveApiStatus];
