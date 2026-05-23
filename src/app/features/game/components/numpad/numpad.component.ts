import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NUMPAD_DIGITS } from './numpad.component.config';

@Component({
  selector: 'app-numpad',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './numpad.component.html',
  styleUrl: './numpad.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumpadComponent {
  readonly disabled = input.required<boolean>();
  readonly digitEntered = output<number>();
  readonly cellCleared = output<void>();

  protected readonly digits = NUMPAD_DIGITS;

  onDigit(digit: number): void {
    if (this.disabled()) {
      return;
    }
    this.digitEntered.emit(digit);
  }

  onClear(): void {
    if (this.disabled()) {
      return;
    }
    this.cellCleared.emit();
  }

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }
}
