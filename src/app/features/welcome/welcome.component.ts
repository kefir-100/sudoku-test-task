import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { APP_CONFIG } from '../../core/config/app-config';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {
  private readonly router = inject(Router);

  onStart(): void {
    void this.router.navigate([`/${APP_CONFIG.routes.play}`]);
  }
}
