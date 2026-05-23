import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_CONFIG } from '../config/app-config';
import { NormalizedErrorKind } from '../../models/normalized-error';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ErrorHandlerService] });
    service = TestBed.inject(ErrorHandlerService);
  });

  it('normalizes HttpErrorResponse status=0 to a network error', () => {
    const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown' });
    const normalized = service.normalizeHttpError(error);
    expect(normalized.kind).toBe(NormalizedErrorKind.Network);
    expect(normalized.message).toBe(APP_CONFIG.snackbar.messages.apiError);
    expect(normalized.httpStatus).toBe(0);
  });

  it('normalizes 5xx to a server error', () => {
    const error = new HttpErrorResponse({ status: 503, statusText: 'Unavailable' });
    const normalized = service.normalizeHttpError(error);
    expect(normalized.kind).toBe(NormalizedErrorKind.Server);
    expect(normalized.httpStatus).toBe(503);
  });

  it('normalizes a thrown Error into a storage NormalizedError', () => {
    const normalized = service.normalizeStorageError(new Error('boom'));
    expect(normalized.kind).toBe(NormalizedErrorKind.Storage);
    expect(normalized.message).toBe('boom');
  });

  it('falls back to the configured storage message when error is not an Error instance', () => {
    const normalized = service.normalizeStorageError('weird-non-error');
    expect(normalized.kind).toBe(NormalizedErrorKind.Storage);
    expect(normalized.message).toBe(APP_CONFIG.snackbar.messages.storageFallback);
  });

  it('handleError logs to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    service.handleError(new Error('global'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
