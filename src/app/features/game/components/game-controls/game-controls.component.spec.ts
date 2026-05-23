import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { type Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameControlsComponent } from './game-controls.component';

interface FakeDialogRef {
  afterClosed: () => Observable<boolean | undefined>;
}

function configureWithDialog(afterClosedValue: boolean | undefined): {
  fixture: ReturnType<typeof TestBed.createComponent<GameControlsComponent>>;
  openSpy: ReturnType<typeof vi.fn>;
} {
  const openSpy = vi.fn<(...args: unknown[]) => FakeDialogRef>().mockReturnValue({
    afterClosed: () => of(afterClosedValue),
  });
  TestBed.configureTestingModule({
    imports: [GameControlsComponent],
    providers: [{ provide: MatDialog, useValue: { open: openSpy } }],
  });
  const fixture = TestBed.createComponent(GameControlsComponent);
  return { fixture, openSpy };
}

describe('GameControlsComponent', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('emits start when no game has started', () => {
    TestBed.configureTestingModule({
      imports: [GameControlsComponent],
      providers: [{ provide: MatDialog, useValue: { open: vi.fn() } }],
    });
    const fixture = TestBed.createComponent(GameControlsComponent);
    fixture.componentRef.setInput('isGameInProgress', false);
    fixture.componentRef.setInput('hasUserEntries', false);
    fixture.componentRef.setInput('canValidate', false);
    fixture.componentRef.setInput('canSolve', false);
    fixture.componentRef.setInput('isLoading', false);
    const emitted = vi.fn();
    fixture.componentInstance.startGame.subscribe(emitted);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    const button = el.querySelector('[data-action="start"]');
    if (button instanceof HTMLButtonElement) {
      button.click();
    }
    expect(emitted).toHaveBeenCalled();
  });

  it('opens the confirm dialog when the user has entries and emits start on confirmation', async () => {
    const { fixture, openSpy } = configureWithDialog(true);
    fixture.componentRef.setInput('isGameInProgress', true);
    fixture.componentRef.setInput('hasUserEntries', true);
    fixture.componentRef.setInput('canValidate', true);
    fixture.componentRef.setInput('canSolve', true);
    fixture.componentRef.setInput('isLoading', false);
    const emitted = vi.fn();
    fixture.componentInstance.startGame.subscribe(emitted);
    fixture.detectChanges();
    await fixture.componentInstance.onStartClicked();
    expect(openSpy).toHaveBeenCalled();
    expect(emitted).toHaveBeenCalled();
  });

  it('does not emit start when the user cancels the confirm dialog', async () => {
    const { fixture, openSpy } = configureWithDialog(false);
    fixture.componentRef.setInput('isGameInProgress', true);
    fixture.componentRef.setInput('hasUserEntries', true);
    fixture.componentRef.setInput('canValidate', true);
    fixture.componentRef.setInput('canSolve', true);
    fixture.componentRef.setInput('isLoading', false);
    const emitted = vi.fn();
    fixture.componentInstance.startGame.subscribe(emitted);
    fixture.detectChanges();
    await fixture.componentInstance.onStartClicked();
    expect(openSpy).toHaveBeenCalled();
    expect(emitted).not.toHaveBeenCalled();
  });

  it('does not emit start when the dialog closes with undefined (backdrop click / escape)', async () => {
    const { fixture } = configureWithDialog(undefined);
    fixture.componentRef.setInput('isGameInProgress', true);
    fixture.componentRef.setInput('hasUserEntries', true);
    fixture.componentRef.setInput('canValidate', true);
    fixture.componentRef.setInput('canSolve', true);
    fixture.componentRef.setInput('isLoading', false);
    const emitted = vi.fn();
    fixture.componentInstance.startGame.subscribe(emitted);
    fixture.detectChanges();
    await fixture.componentInstance.onStartClicked();
    expect(emitted).not.toHaveBeenCalled();
  });
});
