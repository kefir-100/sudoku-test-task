import type { HttpErrorResponse } from '@angular/common/http';
import type { ErrorHandler } from '@angular/core';
import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { NormalizedErrorKind } from '../../models/normalized-error';
import type { NormalizedError } from '../../models/normalized-error';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService implements ErrorHandler {
  normalizeHttpError(error: HttpErrorResponse): NormalizedError {
    const kind = error.status === 0 ? NormalizedErrorKind.Network : NormalizedErrorKind.Server;
    return {
      kind,
      message: APP_CONFIG.snackbar.messages.apiError,
      httpStatus: error.status,
    };
  }

  normalizeStorageError(error: unknown): NormalizedError {
    const message =
      error instanceof Error ? error.message : APP_CONFIG.snackbar.messages.storageFallback;
    return { kind: NormalizedErrorKind.Storage, message };
  }

  handleError(error: unknown): void {
    console.error('[Sudoku] unhandled error', error);
  }
}
