import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NumpadComponent } from './numpad.component';
import { NUMPAD_DIGITS } from './numpad.component.config';

function createFixture(disabled: boolean) {
  const fixture = TestBed.createComponent(NumpadComponent);
  fixture.componentRef.setInput('disabled', disabled);
  fixture.detectChanges();
  return fixture;
}

function queryDigitButtons(fixture: ReturnType<typeof createFixture>): HTMLButtonElement[] {
  const root = fixture.debugElement.nativeElement as HTMLElement;
  return Array.from(root.querySelectorAll<HTMLButtonElement>('[data-action="digit"]'));
}

function queryClearButton(fixture: ReturnType<typeof createFixture>): HTMLButtonElement {
  const root = fixture.debugElement.nativeElement as HTMLElement;
  const button = root.querySelector<HTMLButtonElement>('[data-action="clear"]');
  if (!button) {
    throw new Error('clear button not rendered');
  }
  return button;
}

describe('NumpadComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NumpadComponent] });
  });

  it('renders nine digit buttons (1-9) and a clear button', () => {
    const fixture = createFixture(false);
    const digitButtons = queryDigitButtons(fixture);
    expect(digitButtons).toHaveLength(NUMPAD_DIGITS.length);
    expect(digitButtons.map((b) => b.textContent?.trim())).toEqual(
      NUMPAD_DIGITS.map((d) => String(d)),
    );
    expect(queryClearButton(fixture).textContent?.trim()).toBe('Clear');
  });

  it('renders an accessible aria-label for every digit button', () => {
    const fixture = createFixture(false);
    const digitButtons = queryDigitButtons(fixture);
    digitButtons.forEach((button, index) => {
      const digit = NUMPAD_DIGITS[index];
      expect(button.getAttribute('aria-label')).toBe(`Enter digit ${String(digit)}`);
    });
    expect(queryClearButton(fixture).getAttribute('aria-label')).toBe('Clear cell');
  });

  it('disables all buttons when disabled is true', () => {
    const fixture = createFixture(true);
    queryDigitButtons(fixture).forEach((button) => {
      expect(button.disabled).toBe(true);
    });
    expect(queryClearButton(fixture).disabled).toBe(true);
  });

  it('enables all buttons when disabled is false', () => {
    const fixture = createFixture(false);
    queryDigitButtons(fixture).forEach((button) => {
      expect(button.disabled).toBe(false);
    });
    expect(queryClearButton(fixture).disabled).toBe(false);
  });

  it('emits digitEntered with the clicked digit', () => {
    const fixture = createFixture(false);
    const emitted = vi.fn();
    fixture.componentInstance.digitEntered.subscribe(emitted);
    const digitButtons = queryDigitButtons(fixture);
    const target = digitButtons[4];
    if (!target) {
      throw new Error('expected a digit button at index 4');
    }
    target.click();
    expect(emitted).toHaveBeenCalledWith(NUMPAD_DIGITS[4]);
  });

  it('emits cellCleared when the clear button is clicked', () => {
    const fixture = createFixture(false);
    const cleared = vi.fn();
    fixture.componentInstance.cellCleared.subscribe(cleared);
    queryClearButton(fixture).click();
    expect(cleared).toHaveBeenCalled();
  });

  it('does not emit when a disabled digit button is invoked programmatically', () => {
    const fixture = createFixture(true);
    const emitted = vi.fn();
    const cleared = vi.fn();
    fixture.componentInstance.digitEntered.subscribe(emitted);
    fixture.componentInstance.cellCleared.subscribe(cleared);
    fixture.componentInstance.onDigit(7);
    fixture.componentInstance.onClear();
    expect(emitted).not.toHaveBeenCalled();
    expect(cleared).not.toHaveBeenCalled();
  });

  it('prevents default on mousedown so the focused cell does not lose focus', () => {
    const fixture = createFixture(false);
    const digitButtons = queryDigitButtons(fixture);
    const target = digitButtons[0];
    if (!target) {
      throw new Error('expected a digit button at index 0');
    }
    const event = new MouseEvent('mousedown', { cancelable: true, bubbles: true });
    target.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
