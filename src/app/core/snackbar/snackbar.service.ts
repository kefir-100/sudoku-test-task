import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APP_CONFIG } from '../config/app-config';
import type { SolveApiStatus } from '../../models/solve-api-status';
import type { ValidateApiStatus } from '../../models/validate-api-status';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly snackBar = inject(MatSnackBar);

  showDismissSnackbar(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: APP_CONFIG.snackbar.durationMs,
    });
  }

  showValidationResultSnackbar(status: ValidateApiStatus): void {
    this.showDismissSnackbar(APP_CONFIG.snackbar.validateMessages[status]);
  }

  showSolveResultSnackbar(status: SolveApiStatus): void {
    this.showDismissSnackbar(APP_CONFIG.snackbar.solveMessages[status]);
  }
}
