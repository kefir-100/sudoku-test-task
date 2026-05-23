import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SudokuCell } from '../../../../models/sudoku-cell';
import {
  KEY_BACKSPACE,
  KEY_DELETE,
  KEY_DIGIT_ZERO,
  KEY_ESCAPE,
} from '../../../../shared/keyboard/keyboard-keys';
import { SudokuCellComponent } from './sudoku-cell.component';

const baseCell: SudokuCell = {
  id: 0,
  row: 0,
  column: 0,
  boxIndex: 0,
  originalValue: 5,
  userValue: 5,
  isPrefilled: true,
  isSolverFilled: false,
};

describe('SudokuCellComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SudokuCellComponent] });
  });

  it('renders the cell value', () => {
    const fixture = TestBed.createComponent(SudokuCellComponent);
    fixture.componentRef.setInput('cell', baseCell);
    fixture.componentRef.setInput('isFocused', false);
    fixture.componentRef.setInput('isRelatedHighlight', false);
    fixture.componentRef.setInput('isSameNumberHighlight', false);
    fixture.componentRef.setInput('isConflict', false);
    fixture.componentRef.setInput('isSolverFilled', false);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('5');
  });

  it('renders empty for value 0', () => {
    const fixture = TestBed.createComponent(SudokuCellComponent);
    fixture.componentRef.setInput('cell', {
      ...baseCell,
      originalValue: 0,
      userValue: 0,
      isPrefilled: false,
    });
    fixture.componentRef.setInput('isFocused', false);
    fixture.componentRef.setInput('isRelatedHighlight', false);
    fixture.componentRef.setInput('isSameNumberHighlight', false);
    fixture.componentRef.setInput('isConflict', false);
    fixture.componentRef.setInput('isSolverFilled', false);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('');
  });

  it('prefilled cells are not editable (tabindex -1)', () => {
    const fixture = TestBed.createComponent(SudokuCellComponent);
    fixture.componentRef.setInput('cell', baseCell);
    fixture.componentRef.setInput('isFocused', false);
    fixture.componentRef.setInput('isRelatedHighlight', false);
    fixture.componentRef.setInput('isSameNumberHighlight', false);
    fixture.componentRef.setInput('isConflict', false);
    fixture.componentRef.setInput('isSolverFilled', false);
    fixture.detectChanges();
    const root = fixture.debugElement.nativeElement as HTMLElement;
    const el = root.querySelector('[role="gridcell"]');
    expect(el?.getAttribute('tabindex')).toBe('-1');
  });

  it('emits digitEntered on a 1-9 keypress in editable cell', () => {
    const fixture = TestBed.createComponent(SudokuCellComponent);
    const emitted: number[] = [];
    fixture.componentRef.setInput('cell', {
      ...baseCell,
      originalValue: 0,
      userValue: 0,
      isPrefilled: false,
    });
    fixture.componentRef.setInput('isFocused', true);
    fixture.componentRef.setInput('isRelatedHighlight', false);
    fixture.componentRef.setInput('isSameNumberHighlight', false);
    fixture.componentRef.setInput('isConflict', false);
    fixture.componentRef.setInput('isSolverFilled', false);
    fixture.componentInstance.digitEntered.subscribe((d: number) => emitted.push(d));
    fixture.detectChanges();
    const root = fixture.debugElement.nativeElement as HTMLElement;
    const el = root.querySelector('[role="gridcell"]');
    el?.dispatchEvent(new KeyboardEvent('keyup', { key: '7' }));
    expect(emitted).toEqual([7]);
  });

  it('emits cellCleared on Backspace', () => {
    const fixture = TestBed.createComponent(SudokuCellComponent);
    const cleared = vi.fn();
    fixture.componentRef.setInput('cell', {
      ...baseCell,
      originalValue: 0,
      userValue: 3,
      isPrefilled: false,
    });
    fixture.componentRef.setInput('isFocused', true);
    fixture.componentRef.setInput('isRelatedHighlight', false);
    fixture.componentRef.setInput('isSameNumberHighlight', false);
    fixture.componentRef.setInput('isConflict', false);
    fixture.componentRef.setInput('isSolverFilled', false);
    fixture.componentInstance.cellCleared.subscribe(cleared);
    fixture.detectChanges();
    const root = fixture.debugElement.nativeElement as HTMLElement;
    const el = root.querySelector('[role="gridcell"]');
    el?.dispatchEvent(new KeyboardEvent('keyup', { key: KEY_BACKSPACE }));
    expect(cleared).toHaveBeenCalled();
  });

  it('emits cellCleared on Delete and on the digit 0', () => {
    const fixture = TestBed.createComponent(SudokuCellComponent);
    const cleared = vi.fn();
    fixture.componentRef.setInput('cell', {
      ...baseCell,
      originalValue: 0,
      userValue: 2,
      isPrefilled: false,
    });
    fixture.componentRef.setInput('isFocused', true);
    fixture.componentRef.setInput('isRelatedHighlight', false);
    fixture.componentRef.setInput('isSameNumberHighlight', false);
    fixture.componentRef.setInput('isConflict', false);
    fixture.componentRef.setInput('isSolverFilled', false);
    fixture.componentInstance.cellCleared.subscribe(cleared);
    fixture.detectChanges();
    const root = fixture.debugElement.nativeElement as HTMLElement;
    const el = root.querySelector('[role="gridcell"]');
    el?.dispatchEvent(new KeyboardEvent('keyup', { key: KEY_DELETE }));
    el?.dispatchEvent(new KeyboardEvent('keyup', { key: KEY_DIGIT_ZERO }));
    expect(cleared).toHaveBeenCalledTimes(2);
  });

  it('Escape blurs the cell and prevents default', () => {
    const fixture = TestBed.createComponent(SudokuCellComponent);
    fixture.componentRef.setInput('cell', {
      ...baseCell,
      originalValue: 0,
      userValue: 0,
      isPrefilled: false,
    });
    fixture.componentRef.setInput('isFocused', true);
    fixture.componentRef.setInput('isRelatedHighlight', false);
    fixture.componentRef.setInput('isSameNumberHighlight', false);
    fixture.componentRef.setInput('isConflict', false);
    fixture.componentRef.setInput('isSolverFilled', false);
    fixture.detectChanges();
    const root = fixture.debugElement.nativeElement as HTMLElement;
    const el = root.querySelector('[role="gridcell"]');
    if (!(el instanceof HTMLElement)) {
      throw new Error('gridcell not rendered');
    }
    el.focus();
    const blurSpy = vi.spyOn(el, 'blur');
    el.dispatchEvent(new KeyboardEvent('keyup', { key: KEY_ESCAPE, cancelable: true }));
    expect(blurSpy).toHaveBeenCalled();
  });

  it('does nothing for digit keypress when cell is prefilled', () => {
    const fixture = TestBed.createComponent(SudokuCellComponent);
    const emitted: number[] = [];
    fixture.componentRef.setInput('cell', baseCell);
    fixture.componentRef.setInput('isFocused', true);
    fixture.componentRef.setInput('isRelatedHighlight', false);
    fixture.componentRef.setInput('isSameNumberHighlight', false);
    fixture.componentRef.setInput('isConflict', false);
    fixture.componentRef.setInput('isSolverFilled', false);
    fixture.componentInstance.digitEntered.subscribe((d: number) => emitted.push(d));
    fixture.detectChanges();
    const root = fixture.debugElement.nativeElement as HTMLElement;
    const el = root.querySelector('[role="gridcell"]');
    el?.dispatchEvent(new KeyboardEvent('keyup', { key: '7' }));
    expect(emitted).toEqual([]);
  });

  it('focuses its own gridcell element when isFocused becomes true', () => {
    const fixture = TestBed.createComponent(SudokuCellComponent);
    fixture.componentRef.setInput('cell', {
      ...baseCell,
      originalValue: 0,
      userValue: 0,
      isPrefilled: false,
    });
    fixture.componentRef.setInput('isFocused', false);
    fixture.componentRef.setInput('isRelatedHighlight', false);
    fixture.componentRef.setInput('isSameNumberHighlight', false);
    fixture.componentRef.setInput('isConflict', false);
    fixture.componentRef.setInput('isSolverFilled', false);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const el = (fixture.nativeElement as HTMLElement).querySelector('[role="gridcell"]');
    if (!(el instanceof HTMLElement)) {
      throw new Error('gridcell not rendered');
    }
    expect(document.activeElement).not.toBe(el);
    fixture.componentRef.setInput('isFocused', true);
    fixture.detectChanges();
    expect(document.activeElement).toBe(el);
    document.body.removeChild(fixture.nativeElement);
  });

  it('emits focusRequested when the cell receives focus', () => {
    const fixture = TestBed.createComponent(SudokuCellComponent);
    const focusRequested = vi.fn();
    fixture.componentRef.setInput('cell', {
      ...baseCell,
      originalValue: 0,
      userValue: 0,
      isPrefilled: false,
    });
    fixture.componentRef.setInput('isFocused', false);
    fixture.componentRef.setInput('isRelatedHighlight', false);
    fixture.componentRef.setInput('isSameNumberHighlight', false);
    fixture.componentRef.setInput('isConflict', false);
    fixture.componentRef.setInput('isSolverFilled', false);
    fixture.componentInstance.focusRequested.subscribe(focusRequested);
    fixture.detectChanges();
    const root = fixture.debugElement.nativeElement as HTMLElement;
    const el = root.querySelector('[role="gridcell"]');
    if (!(el instanceof HTMLElement)) {
      throw new Error('gridcell not rendered');
    }
    el.focus();
    expect(focusRequested).toHaveBeenCalled();
  });
});
