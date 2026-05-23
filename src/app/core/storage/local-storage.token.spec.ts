import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LOCAL_STORAGE } from './local-storage.token';

describe('LOCAL_STORAGE token', () => {
  it('returns the real localStorage in a browser environment', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    const storage = TestBed.inject(LOCAL_STORAGE);
    expect(storage).toBe(window.localStorage);
  });

  it('falls back to a noop Storage outside a browser', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const storage = TestBed.inject(LOCAL_STORAGE);
    expect(storage).not.toBe(window.localStorage);
    expect(storage.length).toBe(0);
    expect(storage.getItem('any')).toBeNull();
    expect(storage.key(0)).toBeNull();
    expect(() => {
      storage.setItem('a', 'b');
      storage.removeItem('a');
      storage.clear();
    }).not.toThrow();
  });
});
