import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  output,
} from '@angular/core';
import { SUDOKU_CONFIG } from '../../../../core/config/sudoku.config';
import {
  KEY_ARROW_DOWN,
  KEY_ARROW_LEFT,
  KEY_ARROW_RIGHT,
  KEY_ARROW_UP,
} from '../../../../shared/keyboard/keyboard-keys';
import type { SudokuBoard } from '../../../../models/sudoku-board';
import { ARROW_KEYS } from './sudoku-board.component.config';
import { SudokuCellComponent } from '../sudoku-cell/sudoku-cell.component';

@Component({
  selector: 'app-sudoku-board',
  standalone: true,
  imports: [SudokuCellComponent],
  templateUrl: './sudoku-board.component.html',
  styleUrl: './sudoku-board.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SudokuBoardComponent {
  readonly board = input.required<SudokuBoard>();
  readonly focusedCellId = input.required<number | null>();
  readonly relatedCellIds = input.required<ReadonlySet<number>>();
  readonly sameNumberCellIds = input.required<ReadonlySet<number>>();
  readonly conflictCellIds = input.required<ReadonlySet<number>>();

  readonly digitEntered = output<{ cellId: number; digit: number }>();
  readonly cellCleared = output<number>();
  readonly cellFocused = output<number>();

  readonly rows = computed(() => {
    const cells = this.board().cells;
    const grouped: (typeof cells)[] = [];
    for (let r = 0; r < SUDOKU_CONFIG.boardSize; r++) {
      grouped.push(cells.slice(r * SUDOKU_CONFIG.boardSize, (r + 1) * SUDOKU_CONFIG.boardSize));
    }
    return grouped;
  });

  onDigit(cellId: number, digit: number): void {
    this.digitEntered.emit({ cellId, digit });
  }

  onClear(cellId: number): void {
    this.cellCleared.emit(cellId);
  }

  onFocus(cellId: number): void {
    this.cellFocused.emit(cellId);
  }

  @HostListener('keyup', ['$event'])
  onArrowKey(event: KeyboardEvent): void {
    if (!ARROW_KEYS.has(event.key)) {
      return;
    }
    const currentId = this.focusedCellId();
    if (currentId === null) {
      return;
    }
    const row = Math.floor(currentId / SUDOKU_CONFIG.boardSize);
    const column = currentId % SUDOKU_CONFIG.boardSize;
    let nextRow = row;
    let nextColumn = column;
    if (event.key === KEY_ARROW_UP) nextRow = Math.max(0, row - 1);
    if (event.key === KEY_ARROW_DOWN) nextRow = Math.min(SUDOKU_CONFIG.boardSize - 1, row + 1);
    if (event.key === KEY_ARROW_LEFT) nextColumn = Math.max(0, column - 1);
    if (event.key === KEY_ARROW_RIGHT)
      nextColumn = Math.min(SUDOKU_CONFIG.boardSize - 1, column + 1);
    const nextId = nextRow * SUDOKU_CONFIG.boardSize + nextColumn;
    if (nextId === currentId) {
      return;
    }
    event.preventDefault();
    this.cellFocused.emit(nextId);
  }
}
