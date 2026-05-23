import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
  it('renders message and emits retry on click', () => {
    const fixture = TestBed.createComponent(ErrorStateComponent);
    fixture.componentRef.setInput('message', 'Something went wrong');
    const retry = vi.fn();
    fixture.componentInstance.retry.subscribe(retry);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Something went wrong');
    const button = el.querySelector('button');
    if (button) {
      button.click();
    }
    expect(retry).toHaveBeenCalled();
  });
});
