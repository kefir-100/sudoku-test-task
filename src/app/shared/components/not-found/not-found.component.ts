import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  onBackToSudoku(): void {
    void this.router.navigate([`/${APP_CONFIG.routes.welcome}`]);
  }
}
