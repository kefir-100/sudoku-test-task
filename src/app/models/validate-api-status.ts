export const ValidateApiStatus = {
  Solved: 'solved',
  Unsolved: 'unsolved',
  Broken: 'broken',
} as const;

export type ValidateApiStatus = (typeof ValidateApiStatus)[keyof typeof ValidateApiStatus];
