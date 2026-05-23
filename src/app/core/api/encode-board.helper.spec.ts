import { describe, expect, it } from 'vitest';
import { encodeBoardParam, encodeFormUrlEncoded } from './encode-board.helper';

const README_BOARD: readonly (readonly number[])[] = [
  [0, 0, 0, 0, 0, 0, 8, 0, 0],
  [0, 0, 4, 0, 0, 8, 0, 0, 9],
  [0, 7, 0, 0, 0, 0, 0, 0, 5],
  [0, 1, 0, 0, 7, 5, 0, 0, 8],
  [0, 5, 6, 0, 9, 1, 3, 0, 0],
  [7, 8, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 9, 3, 0, 0, 1, 0],
  [0, 0, 5, 7, 0, 0, 4, 0, 3],
];

describe('encodeBoardParam', () => {
  it('matches the Sudoku README encoding for the example board', () => {
    const encoded = encodeBoardParam(README_BOARD);
    expect(encoded).toContain('%5B0%2C0%2C0%2C0%2C0%2C0%2C8%2C0%2C0%5D');
    expect(encoded).toContain('%5B0%2C0%2C5%2C7%2C0%2C0%2C4%2C0%2C3%5D');
    expect(encoded.split('%2C%5B').length).toBe(9);
  });
});

describe('encodeFormUrlEncoded', () => {
  it('wraps each top-level value with brackets and joins with &', () => {
    const result = encodeFormUrlEncoded({ board: README_BOARD });
    expect(result.startsWith('board=%5B%5B')).toBe(true);
    expect(result.endsWith('%5D%5D')).toBe(true);
  });

  it('returns an empty string for empty input', () => {
    expect(encodeFormUrlEncoded({})).toBe('');
  });

  it('encodes multiple entries joined by &', () => {
    const result = encodeFormUrlEncoded({ board: [[1]], other: [[2]] });
    expect(result.split('&').length).toBe(2);
    expect(result.startsWith('board=%5B%5B1%5D%5D')).toBe(true);
    expect(result).toContain('other=%5B%5B2%5D%5D');
  });
});
