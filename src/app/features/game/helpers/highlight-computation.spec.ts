import { describe, expect, it } from 'vitest';
import type { SudokuBoard } from '../../../models/sudoku-board';
import { computeRelatedCellIds, computeSameNumberCellIds } from './highlight-computation';

const buildBoard = (values: number[]): SudokuBoard => ({
  cells: values.map((v, i) => ({
    id: i,
    row: Math.floor(i / 9),
    column: i % 9,
    boxIndex: Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3),
    originalValue: v,
    userValue: v,
    isPrefilled: v !== 0,
    isSolverFilled: false,
  })),
});

describe('computeRelatedCellIds', () => {
  it('returns empty when no cell is focused', () => {
    expect(computeRelatedCellIds(buildBoard(Array<number>(81).fill(0)), null).size).toBe(0);
  });

  it('returns 20 cells (same row + column + box, excluding the focused cell)', () => {
    const result = computeRelatedCellIds(buildBoard(Array<number>(81).fill(0)), 0);
    expect(result.size).toBe(20);
    expect(result.has(0)).toBe(false);
  });
});

describe('computeSameNumberCellIds', () => {
  it('returns empty when no cell is focused', () => {
    expect(computeSameNumberCellIds(buildBoard(Array<number>(81).fill(0)), null).size).toBe(0);
  });

  it('returns empty when focused cell has value 0', () => {
    expect(computeSameNumberCellIds(buildBoard(Array<number>(81).fill(0)), 0).size).toBe(0);
  });

  it('returns all cells with the same value', () => {
    const values = Array<number>(81).fill(0);
    values[0] = 5;
    values[40] = 5;
    values[80] = 5;
    const result = computeSameNumberCellIds(buildBoard(values), 0);
    expect(result.has(40) && result.has(80)).toBe(true);
    expect(result.has(0)).toBe(false);
  });
});
