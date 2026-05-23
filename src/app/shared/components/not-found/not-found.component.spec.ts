import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { APP_CONFIG } from '../../../core/config/app-config';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([{ path: APP_CONFIG.routes.welcome, children: [] }])],
    });
  });

  it('renders 404 and the Back to Sudoku button', () => {
    const fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.textContent).toContain('404');
    expect(el.textContent).toContain('Back to Sudoku');
  });

  it('navigates to / when the back button is clicked', async () => {
    const fixture = TestBed.createComponent(NotFoundComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    const button = el.querySelector('button');
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error('Back-to-Sudoku button was not rendered');
    }
    button.click();
    await fixture.whenStable();
    expect(router.url).toBe(`/${APP_CONFIG.routes.welcome}`);
  });
});
