import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SolveApiStatus } from '../../models/solve-api-status';
import { ValidateApiStatus } from '../../models/validate-api-status';
import { APP_CONFIG } from '../config/app-config';
import { SnackbarService } from './snackbar.service';

describe('SnackbarService', () => {
  let service: SnackbarService;
  let snackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBar = { open: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SnackbarService, { provide: MatSnackBar, useValue: snackBar }],
    });
    service = TestBed.inject(SnackbarService);
  });

  it('opens a dismissable snackbar with the configured duration', () => {
    service.showDismissSnackbar('Hello');
    expect(snackBar.open).toHaveBeenCalledWith('Hello', 'Dismiss', {
      duration: APP_CONFIG.snackbar.durationMs,
    });
  });

  describe('validate status messages', () => {
    const cases: [ValidateApiStatus, string][] = [
      [ValidateApiStatus.Solved, APP_CONFIG.snackbar.validateMessages[ValidateApiStatus.Solved]],
      [
        ValidateApiStatus.Unsolved,
        APP_CONFIG.snackbar.validateMessages[ValidateApiStatus.Unsolved],
      ],
      [ValidateApiStatus.Broken, APP_CONFIG.snackbar.validateMessages[ValidateApiStatus.Broken]],
    ];

    it.each(cases)('maps %s to the matching message', (status, expected) => {
      service.showValidationResultSnackbar(status);
      expect(snackBar.open).toHaveBeenCalledWith(
        expected,
        'Dismiss',
        expect.objectContaining({ duration: APP_CONFIG.snackbar.durationMs }),
      );
    });

    it('covers every ValidateApiStatus value', () => {
      const handled = new Set(cases.map(([s]) => s));
      const all = new Set(Object.values(ValidateApiStatus));
      expect(handled).toEqual(all);
    });
  });

  describe('solve status messages', () => {
    const cases: [SolveApiStatus, string][] = [
      [SolveApiStatus.Solved, APP_CONFIG.snackbar.solveMessages[SolveApiStatus.Solved]],
      [SolveApiStatus.Unsolved, APP_CONFIG.snackbar.solveMessages[SolveApiStatus.Unsolved]],
      [SolveApiStatus.Broken, APP_CONFIG.snackbar.solveMessages[SolveApiStatus.Broken]],
      [SolveApiStatus.Unsolvable, APP_CONFIG.snackbar.solveMessages[SolveApiStatus.Unsolvable]],
    ];

    it.each(cases)('maps %s to the matching message', (status, expected) => {
      service.showSolveResultSnackbar(status);
      expect(snackBar.open).toHaveBeenCalledWith(
        expected,
        'Dismiss',
        expect.objectContaining({ duration: APP_CONFIG.snackbar.durationMs }),
      );
    });

    it('covers every SolveApiStatus value', () => {
      const handled = new Set(cases.map(([s]) => s));
      const all = new Set(Object.values(SolveApiStatus));
      expect(handled).toEqual(all);
    });
  });
});
