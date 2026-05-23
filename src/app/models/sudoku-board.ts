import type { SudokuCell } from './sudoku-cell';

export interface SudokuBoard {
  readonly cells: readonly SudokuCell[];
}
