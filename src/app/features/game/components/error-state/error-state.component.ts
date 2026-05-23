import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorStateComponent {
  readonly message = input.required<string>();
  readonly retry = output<void>();
}
