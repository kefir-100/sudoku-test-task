export interface SudokuCell {
  readonly id: number;
  readonly row: number;
  readonly column: number;
  readonly boxIndex: number;
  readonly originalValue: number;
  readonly userValue: number;
  readonly isPrefilled: boolean;
  readonly isSolverFilled: boolean;
}
