import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LocalStorageService] });
    service = TestBed.inject(LocalStorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('writes and reads back a typed value', () => {
    service.write('key', { a: 1 });
    expect(service.read<{ a: number }>('key')).toEqual({ a: 1 });
  });

  it('returns null for a missing key', () => {
    expect(service.read('missing')).toBeNull();
  });

  it('remove deletes the entry', () => {
    service.write('key', 'x');
    service.remove('key');
    expect(service.read('key')).toBeNull();
  });

  it('clear wipes all entries', () => {
    service.write('a', 1);
    service.write('b', 2);
    service.clear();
    expect(service.read('a')).toBeNull();
    expect(service.read('b')).toBeNull();
  });

  it('returns null on JSON parse failure', () => {
    localStorage.setItem('broken', '{not-json');
    expect(service.read('broken')).toBeNull();
  });
});
