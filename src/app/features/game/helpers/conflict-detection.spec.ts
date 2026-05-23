import { describe, expect, it } from 'vitest';
import type { SudokuBoard } from '../../../models/sudoku-board';
import { computeConflictCellIds } from './conflict-detection';

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

describe('computeConflictCellIds', () => {
  it('returns an empty set for a board with no conflicts', () => {
    const board = buildBoard(Array<number>(81).fill(0));
    expect(computeConflictCellIds(board).size).toBe(0);
  });

  it('detects duplicates in the same row', () => {
    const values = Array<number>(81).fill(0);
    values[0] = 5;
    values[1] = 5;
    const board = buildBoard(values);
    const conflicts = computeConflictCellIds(board);
    expect(conflicts.has(0)).toBe(true);
    expect(conflicts.has(1)).toBe(true);
  });

  it('detects duplicates in the same column', () => {
    const values = Array<number>(81).fill(0);
    values[0] = 7;
    values[9] = 7;
    const conflicts = computeConflictCellIds(buildBoard(values));
    expect(conflicts.has(0) && conflicts.has(9)).toBe(true);
  });

  it('detects duplicates in the same 3x3 box', () => {
    const values = Array<number>(81).fill(0);
    values[0] = 3;
    values[10] = 3;
    const conflicts = computeConflictCellIds(buildBoard(values));
    expect(conflicts.has(0) && conflicts.has(10)).toBe(true);
  });

  it('ignores zero values when computing conflicts', () => {
    const conflicts = computeConflictCellIds(buildBoard(Array<number>(81).fill(0)));
    expect(conflicts.size).toBe(0);
  });
});
