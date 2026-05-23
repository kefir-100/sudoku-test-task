import { Injectable } from '@angular/core';
import { SUDOKU_CONFIG } from '../config/sudoku.config';
import type { RawBoard } from '../../models/raw-board';
import type { SudokuBoard } from '../../models/sudoku-board';
import type { SudokuCell } from '../../models/sudoku-cell';

@Injectable({ providedIn: 'root' })
export class BoardMappingService {
  toUiBoard(rawBoard: RawBoard): SudokuBoard {
    const cells: SudokuCell[] = [];
    for (let row = 0; row < SUDOKU_CONFIG.boardSize; row++) {
      for (let column = 0; column < SUDOKU_CONFIG.boardSize; column++) {
        const value = rawBoard[row]?.[column] ?? 0;
        cells.push({
          id: row * SUDOKU_CONFIG.boardSize + column,
          row,
          column,
          boxIndex:
            Math.floor(row / SUDOKU_CONFIG.boxSize) * SUDOKU_CONFIG.boxSize +
            Math.floor(column / SUDOKU_CONFIG.boxSize),
          originalValue: value,
          userValue: value,
          isPrefilled: value !== 0,
          isSolverFilled: false,
        });
      }
    }
    return { cells };
  }

  toWire(board: SudokuBoard): RawBoard {
    return this.cellsToMatrix(board.cells, (cell) => cell.userValue);
  }

  toOriginalMatrix(board: SudokuBoard): RawBoard {
    return this.cellsToMatrix(board.cells, (cell) => cell.originalValue);
  }

  updateUserValue(board: SudokuBoard, cellId: number, value: number): SudokuBoard {
    const cell = board.cells[cellId];
    if (cell === undefined) {
      return board;
    }
    if (cell.isPrefilled) {
      return board;
    }

    if (cell.userValue === value && !cell.isSolverFilled) {
      return board;
    }
    const updatedCell: SudokuCell = { ...cell, userValue: value, isSolverFilled: false };
    const nextCells = board.cells.slice();
    nextCells.splice(cellId, 1, updatedCell);
    return { cells: nextCells };
  }

  applySolution(board: SudokuBoard, solution: RawBoard): SudokuBoard {
    return {
      cells: board.cells.map((cell) => {
        if (cell.isPrefilled) {
          return cell;
        }
        const solutionValue = solution[cell.row]?.[cell.column] ?? 0;
        const isSolverFilled = cell.userValue !== solutionValue || cell.userValue === 0;
        return { ...cell, userValue: solutionValue, isSolverFilled };
      }),
    };
  }

  private cellsToMatrix(
    cells: readonly SudokuCell[],
    valueOf: (cell: SudokuCell) => number,
  ): RawBoard {
    const rows: number[][] = Array.from({ length: SUDOKU_CONFIG.boardSize }, () =>
      Array<number>(SUDOKU_CONFIG.boardSize).fill(0),
    );
    for (const cell of cells) {
      const targetRow = rows[cell.row];
      if (targetRow) {
        targetRow[cell.column] = valueOf(cell);
      }
    }
    return rows;
  }
}
