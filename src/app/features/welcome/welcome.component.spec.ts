import { provideRouter, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { APP_CONFIG } from '../../core/config/app-config';
import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [provideRouter([{ path: APP_CONFIG.routes.play, children: [] }])],
    });
  });

  it('renders title and Start Sudoku CTA', () => {
    const fixture = TestBed.createComponent(WelcomeComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.textContent).toContain(APP_CONFIG.titles.welcome);
    expect(el.textContent).toContain('Start Sudoku');
  });

  it('navigates to /play when CTA is clicked', async () => {
    const fixture = TestBed.createComponent(WelcomeComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    const button = el.querySelector('button');
    expect(button).toBeTruthy();
    if (button) {
      button.click();
    }
    await fixture.whenStable();
    expect(router.url).toBe(`/${APP_CONFIG.routes.play}`);
  });
});
