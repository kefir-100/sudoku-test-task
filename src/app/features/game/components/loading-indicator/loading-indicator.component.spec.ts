import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { APP_CONFIG } from '../../../../core/config/app-config';
import { LoadingIndicatorComponent } from './loading-indicator.component';

const CUSTOM_LABEL = 'Fetching board';

describe('LoadingIndicatorComponent', () => {
  it('renders default label', () => {
    const fixture = TestBed.createComponent(LoadingIndicatorComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.textContent).toContain(APP_CONFIG.defaults.loadingIndicatorLabel);
  });

  it('renders custom label', () => {
    const fixture = TestBed.createComponent(LoadingIndicatorComponent);
    fixture.componentRef.setInput('label', CUSTOM_LABEL);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.textContent).toContain(CUSTOM_LABEL);
  });
});
