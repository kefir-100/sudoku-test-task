import type { SudokuBoard } from '../../../models/sudoku-board';

export const computeRelatedCellIds = (
  board: SudokuBoard,
  focusedCellId: number | null,
): ReadonlySet<number> => {
  if (focusedCellId === null) {
    return new Set();
  }
  const focused = board.cells.find((c) => c.id === focusedCellId);
  if (!focused) {
    return new Set();
  }
  const related = new Set<number>();
  for (const cell of board.cells) {
    if (cell.id === focused.id) {
      continue;
    }
    if (
      cell.row === focused.row ||
      cell.column === focused.column ||
      cell.boxIndex === focused.boxIndex
    ) {
      related.add(cell.id);
    }
  }
  return related;
};

export const computeSameNumberCellIds = (
  board: SudokuBoard,
  focusedCellId: number | null,
): ReadonlySet<number> => {
  if (focusedCellId === null) {
    return new Set();
  }
  const focused = board.cells.find((c) => c.id === focusedCellId);
  if (!focused || focused.userValue === 0) {
    return new Set();
  }
  const matches = new Set<number>();
  for (const cell of board.cells) {
    if (cell.id !== focused.id && cell.userValue === focused.userValue) {
      matches.add(cell.id);
    }
  }
  return matches;
};
