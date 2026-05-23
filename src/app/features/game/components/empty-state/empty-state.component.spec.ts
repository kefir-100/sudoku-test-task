import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { APP_CONFIG } from '../../../../core/config/app-config';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  it('renders the default message', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.textContent).toContain(APP_CONFIG.defaults.emptyStateMessage);
  });

  it('renders a custom message when the input is set', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('message', 'Custom hint');
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.querySelector('.empty__message')?.textContent).toContain('Custom hint');
  });

  it('marks the decorative grid preview as aria-hidden', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    const preview = el.querySelector('.empty__preview');
    expect(preview).not.toBeNull();
    expect(preview?.getAttribute('aria-hidden')).toBe('true');
  });

  it('does not embed any interactive board components', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.querySelector('app-sudoku-board')).toBeNull();
  });
});
