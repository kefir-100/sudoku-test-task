import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { APP_CONFIG } from '../../../../core/config/app-config';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly message = input<string>(APP_CONFIG.defaults.emptyStateMessage);
}
