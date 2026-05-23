import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BoardMappingService } from '../../../../core/mapping/board-mapping.service';
import {
  KEY_ARROW_DOWN,
  KEY_ARROW_LEFT,
  KEY_ARROW_RIGHT,
  KEY_ARROW_UP,
} from '../../../../shared/keyboard/keyboard-keys';
import type { SudokuBoard } from '../../../../models/sudoku-board';
import { SudokuBoardComponent } from './sudoku-board.component';

function createFixture(board: SudokuBoard, focusedCellId: number | null = null) {
  const fixture = TestBed.createComponent(SudokuBoardComponent);
  fixture.componentRef.setInput('board', board);
  fixture.componentRef.setInput('focusedCellId', focusedCellId);
  fixture.componentRef.setInput('relatedCellIds', new Set<number>());
  fixture.componentRef.setInput('sameNumberCellIds', new Set<number>());
  fixture.componentRef.setInput('conflictCellIds', new Set<number>());
  fixture.detectChanges();
  return fixture;
}

describe('SudokuBoardComponent', () => {
  let mapper: BoardMappingService;
  let board: SudokuBoard;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BoardMappingService] });
    mapper = TestBed.inject(BoardMappingService);
    board = mapper.toUiBoard(Array.from({ length: 9 }, () => Array<number>(9).fill(0)));
  });

  it('renders 81 cells', () => {
    const fixture = createFixture(board);
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.querySelectorAll('[role="gridcell"]').length).toBe(81);
  });

  it('rows() splits the board into 9 rows of 9 cells', () => {
    const fixture = createFixture(board);
    const rows = fixture.componentInstance.rows();
    expect(rows.length).toBe(9);
    expect(rows.every((r) => r.length === 9)).toBe(true);
  });

  it('onDigit emits {cellId, digit}', () => {
    const fixture = createFixture(board);
    const emitted = vi.fn();
    fixture.componentInstance.digitEntered.subscribe(emitted);
    fixture.componentInstance.onDigit(5, 7);
    expect(emitted).toHaveBeenCalledWith({ cellId: 5, digit: 7 });
  });

  it('onClear emits the cellId', () => {
    const fixture = createFixture(board);
    const emitted = vi.fn();
    fixture.componentInstance.cellCleared.subscribe(emitted);
    fixture.componentInstance.onClear(12);
    expect(emitted).toHaveBeenCalledWith(12);
  });

  it('onFocus emits the cellId', () => {
    const fixture = createFixture(board);
    const emitted = vi.fn();
    fixture.componentInstance.cellFocused.subscribe(emitted);
    fixture.componentInstance.onFocus(33);
    expect(emitted).toHaveBeenCalledWith(33);
  });

  it('ArrowDown from cell 40 (row 4 col 4) emits cellFocused for cell 49 (row 5 col 4)', () => {
    const fixture = createFixture(board, 40);
    const emitted = vi.fn();
    fixture.componentInstance.cellFocused.subscribe(emitted);
    fixture.componentInstance.onArrowKey(
      new KeyboardEvent('keyup', { key: KEY_ARROW_DOWN, cancelable: true }),
    );
    expect(emitted).toHaveBeenCalledWith(49);
  });

  it('ArrowUp from cell 40 emits cellFocused for cell 31', () => {
    const fixture = createFixture(board, 40);
    const emitted = vi.fn();
    fixture.componentInstance.cellFocused.subscribe(emitted);
    fixture.componentInstance.onArrowKey(
      new KeyboardEvent('keyup', { key: KEY_ARROW_UP, cancelable: true }),
    );
    expect(emitted).toHaveBeenCalledWith(31);
  });

  it('ArrowLeft from cell 40 emits cellFocused for cell 39', () => {
    const fixture = createFixture(board, 40);
    const emitted = vi.fn();
    fixture.componentInstance.cellFocused.subscribe(emitted);
    fixture.componentInstance.onArrowKey(
      new KeyboardEvent('keyup', { key: KEY_ARROW_LEFT, cancelable: true }),
    );
    expect(emitted).toHaveBeenCalledWith(39);
  });

  it('ArrowRight from cell 40 emits cellFocused for cell 41', () => {
    const fixture = createFixture(board, 40);
    const emitted = vi.fn();
    fixture.componentInstance.cellFocused.subscribe(emitted);
    fixture.componentInstance.onArrowKey(
      new KeyboardEvent('keyup', { key: KEY_ARROW_RIGHT, cancelable: true }),
    );
    expect(emitted).toHaveBeenCalledWith(41);
  });

  it('ArrowUp at row 0 does not move (clamped) and does not emit', () => {
    const fixture = createFixture(board, 4);
    const emitted = vi.fn();
    fixture.componentInstance.cellFocused.subscribe(emitted);
    fixture.componentInstance.onArrowKey(
      new KeyboardEvent('keyup', { key: KEY_ARROW_UP, cancelable: true }),
    );
    expect(emitted).not.toHaveBeenCalled();
  });

  it('ArrowRight at last column does not move and does not emit', () => {
    const fixture = createFixture(board, 8);
    const emitted = vi.fn();
    fixture.componentInstance.cellFocused.subscribe(emitted);
    fixture.componentInstance.onArrowKey(
      new KeyboardEvent('keyup', { key: KEY_ARROW_RIGHT, cancelable: true }),
    );
    expect(emitted).not.toHaveBeenCalled();
  });

  it('non-arrow key is ignored', () => {
    const fixture = createFixture(board, 40);
    const emitted = vi.fn();
    fixture.componentInstance.cellFocused.subscribe(emitted);
    fixture.componentInstance.onArrowKey(
      new KeyboardEvent('keyup', { key: 'a', cancelable: true }),
    );
    expect(emitted).not.toHaveBeenCalled();
  });

  it('arrow key with no focused cell is a no-op', () => {
    const fixture = createFixture(board, null);
    const emitted = vi.fn();
    fixture.componentInstance.cellFocused.subscribe(emitted);
    fixture.componentInstance.onArrowKey(
      new KeyboardEvent('keyup', { key: KEY_ARROW_DOWN, cancelable: true }),
    );
    expect(emitted).not.toHaveBeenCalled();
  });
});
