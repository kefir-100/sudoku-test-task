import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { CoalesceEmptyPipe } from '../../../../shared/pipes/coalesce-empty.pipe';
import {
  DIGIT_KEY_PATTERN,
  KEY_BACKSPACE,
  KEY_DELETE,
  KEY_DIGIT_ZERO,
  KEY_ESCAPE,
} from '../../../../shared/keyboard/keyboard-keys';
import type { SudokuCell } from '../../../../models/sudoku-cell';

@Component({
  selector: 'app-sudoku-cell',
  standalone: true,
  imports: [CoalesceEmptyPipe],
  templateUrl: './sudoku-cell.component.html',
  styleUrl: './sudoku-cell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SudokuCellComponent {
  readonly cell = input.required<SudokuCell>();
  readonly isFocused = input.required<boolean>();
  readonly isRelatedHighlight = input.required<boolean>();
  readonly isSameNumberHighlight = input.required<boolean>();
  readonly isConflict = input.required<boolean>();
  readonly isSolverFilled = input.required<boolean>();

  readonly digitEntered = output<number>();
  readonly cellCleared = output<void>();
  readonly focusRequested = output<void>();

  private readonly focusableCell = viewChild.required<ElementRef<HTMLElement>>('focusableCell');

  constructor() {
    effect(() => {
      if (!this.isFocused()) {
        return;
      }
      const el = this.focusableCell().nativeElement;
      if (document.activeElement !== el) {
        el.focus();
      }
    });
  }

  onKeyup(event: KeyboardEvent): void {
    if (event.key === KEY_ESCAPE) {
      (event.currentTarget as HTMLElement | null)?.blur();
      event.preventDefault();
      return;
    }
    if (this.cell().isPrefilled) {
      return;
    }
    if (DIGIT_KEY_PATTERN.test(event.key)) {
      this.digitEntered.emit(Number(event.key));
      event.preventDefault();
      return;
    }
    if ([KEY_BACKSPACE, KEY_DELETE, KEY_DIGIT_ZERO].includes(event.key)) {
      this.cellCleared.emit();
      event.preventDefault();
    }
  }

  onFocus(): void {
    this.focusRequested.emit();
  }
}
