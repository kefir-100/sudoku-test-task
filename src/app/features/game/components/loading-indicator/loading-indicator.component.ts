import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { APP_CONFIG } from '../../../../core/config/app-config';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingIndicatorComponent {
  readonly label = input<string>(APP_CONFIG.defaults.loadingIndicatorLabel);
}
