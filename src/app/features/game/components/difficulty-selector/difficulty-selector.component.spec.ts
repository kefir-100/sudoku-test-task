import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { GameDifficultyLevel } from '../../../../models/game-difficulty-level';
import { DifficultySelectorComponent } from './difficulty-selector.component';

describe('DifficultySelectorComponent', () => {
  it('defaults to random', () => {
    const fixture = TestBed.createComponent(DifficultySelectorComponent);
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe(GameDifficultyLevel.Random);
  });

  it('emits difficultyChanged when selection changes', () => {
    const fixture = TestBed.createComponent(DifficultySelectorComponent);
    fixture.componentRef.setInput('disabled', false);
    const emitted = vi.fn();
    fixture.componentInstance.difficultyChanged.subscribe(emitted);
    fixture.detectChanges();
    fixture.componentInstance.onSelectionChange(GameDifficultyLevel.Hard);
    expect(emitted).toHaveBeenCalledWith(GameDifficultyLevel.Hard);
  });
});
