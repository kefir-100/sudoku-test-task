import { describe, expect, it } from 'vitest';
import { CoalesceEmptyPipe } from './coalesce-empty.pipe';

describe('CoalesceEmptyPipe', () => {
  const pipe = new CoalesceEmptyPipe();
  it('returns empty string for 0', () => {
    expect(pipe.transform(0)).toBe('');
  });
  it('returns digit string for 1-9', () => {
    for (let i = 1; i <= 9; i++) {
      expect(pipe.transform(i)).toBe(String(i));
    }
  });
});
