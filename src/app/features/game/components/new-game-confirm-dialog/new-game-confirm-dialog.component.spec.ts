import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewGameConfirmDialogComponent } from './new-game-confirm-dialog.component';

describe('NewGameConfirmDialogComponent', () => {
  let close: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    close = vi.fn();
    TestBed.configureTestingModule({
      imports: [NewGameConfirmDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: { close } }],
    });
  });

  it('closes with true on confirm', () => {
    const fixture = TestBed.createComponent(NewGameConfirmDialogComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('button');
    const confirm = buttons[1];
    if (confirm instanceof HTMLButtonElement) {
      confirm.click();
      expect(close).toHaveBeenCalledWith(true);
    }
  });

  it('closes with false on cancel', () => {
    const fixture = TestBed.createComponent(NewGameConfirmDialogComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('button');
    const cancel = buttons[0];
    if (cancel instanceof HTMLButtonElement) {
      cancel.click();
      expect(close).toHaveBeenCalledWith(false);
    }
  });

  describe('onClickClose', () => {
    it('forwards true to dialogRef.close exactly once', () => {
      const fixture = TestBed.createComponent(NewGameConfirmDialogComponent);
      fixture.componentInstance.onClickClose(true);
      expect(close).toHaveBeenCalledTimes(1);
      expect(close).toHaveBeenCalledWith(true);
    });

    it('forwards false to dialogRef.close exactly once', () => {
      const fixture = TestBed.createComponent(NewGameConfirmDialogComponent);
      fixture.componentInstance.onClickClose(false);
      expect(close).toHaveBeenCalledTimes(1);
      expect(close).toHaveBeenCalledWith(false);
    });

    it('does not call dialogRef.close when never invoked', () => {
      TestBed.createComponent(NewGameConfirmDialogComponent);
      expect(close).not.toHaveBeenCalled();
    });
  });
});
