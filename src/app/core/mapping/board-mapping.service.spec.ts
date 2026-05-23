import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { RawBoard } from '../../models/raw-board';
import { BoardMappingService } from './board-mapping.service';

const SAMPLE: RawBoard = [
  [7, 0, 8, 0, 0, 9, 0, 0, 0],
  [1, 0, 0, 0, 5, 0, 7, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 3, 6],
  [0, 0, 3, 0, 0, 0, 0, 0, 7],
  [0, 7, 0, 0, 9, 0, 0, 6, 0],
  [5, 0, 1, 0, 8, 2, 0, 7, 8],
  [0, 4, 2, 9, 8, 0, 0, 5, 3],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 0, 7, 5, 0, 3, 0, 0, 4],
];

describe('BoardMappingService', () => {
  let service: BoardMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BoardMappingService] });
    service = TestBed.inject(BoardMappingService);
  });

  it('toUiBoard produces 81 cells', () => {
    const board = service.toUiBoard(SAMPLE);
    expect(board.cells).toHaveLength(81);
  });

  it('marks non-zero cells as prefilled', () => {
    const board = service.toUiBoard(SAMPLE);
    expect(board.cells[0]?.isPrefilled).toBe(true);
    expect(board.cells[1]?.isPrefilled).toBe(false);
  });

  it('computes correct row, column, boxIndex', () => {
    const board = service.toUiBoard(SAMPLE);
    const cell14 = board.cells[14];
    expect(cell14?.row).toBe(1);
    expect(cell14?.column).toBe(5);
    expect(cell14?.boxIndex).toBe(1);
  });

  it('toWire round-trips a board with user entries', () => {
    const board = service.toUiBoard(SAMPLE);
    const updated = service.updateUserValue(board, 1, 9);
    const wire = service.toWire(updated);
    expect(wire[0]?.[1]).toBe(9);
    expect(wire[0]?.[0]).toBe(7);
  });

  it('updateUserValue ignores prefilled cells', () => {
    const board = service.toUiBoard(SAMPLE);
    const updated = service.updateUserValue(board, 0, 5);
    expect(updated.cells[0]?.userValue).toBe(7);
  });

  it('updateUserValue returns the same board reference for an out-of-range cellId', () => {
    const board = service.toUiBoard(SAMPLE);
    expect(service.updateUserValue(board, 999, 5)).toBe(board);
    expect(service.updateUserValue(board, -1, 5)).toBe(board);
  });

  it('updateUserValue returns the same board reference when value unchanged on a user-owned cell', () => {
    const board = service.toUiBoard(SAMPLE);
    const first = service.updateUserValue(board, 1, 9);
    const second = service.updateUserValue(first, 1, 9);
    expect(second).toBe(first);
  });

  it('updateUserValue clears isSolverFilled when user re-enters the solver value', () => {
    const board = service.toUiBoard(SAMPLE);
    const solution: RawBoard = SAMPLE.map((row) => row.map((v) => v || 1));
    const solved = service.applySolution(board, solution);
    const solverCell = solved.cells.find((c) => c.isSolverFilled);
    if (!solverCell) {
      throw new Error('expected at least one solver-filled cell');
    }
    const reclaimed = service.updateUserValue(solved, solverCell.id, solverCell.userValue);
    expect(reclaimed.cells[solverCell.id]?.isSolverFilled).toBe(false);
    expect(reclaimed.cells[solverCell.id]?.userValue).toBe(solverCell.userValue);
  });

  it('toOriginalMatrix returns the prefilled board, ignoring user entries', () => {
    const board = service.toUiBoard(SAMPLE);
    const updated = service.updateUserValue(board, 1, 9);
    const original = service.toOriginalMatrix(updated);
    expect(original[0]?.[1]).toBe(0);
    expect(original[0]?.[0]).toBe(7);
  });

  it('applySolution marks solver-filled cells correctly', () => {
    const board = service.toUiBoard(SAMPLE);
    const solution: RawBoard = SAMPLE.map((row) => row.map((v) => v || 1));
    const solved = service.applySolution(board, solution);
    expect(solved.cells[1]?.isSolverFilled).toBe(true);
    expect(solved.cells[0]?.isSolverFilled).toBe(false);
  });
});
