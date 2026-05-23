import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { APP_CONFIG } from '../config/app-config';
import { HTTP_CONTENT_TYPE, HTTP_HEADER } from '../config/http-headers.config';
import { GameDifficultyLevel } from '../../models/game-difficulty-level';
import { SolveApiStatus } from '../../models/solve-api-status';
import { formUrlEncodedInterceptor } from './form-url-encoded.interceptor';

const OTHER_ORIGIN_URL = 'https://example.com/whatever';

describe('formUrlEncodedInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([formUrlEncodedInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  it('form-encodes POST bodies to Sudoku', () => {
    const url = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.solve}`;
    http.post(url, { board: [[1]] }).subscribe();
    const req = controller.expectOne(url);
    expect(req.request.headers.get(HTTP_HEADER.ContentType)).toBe(HTTP_CONTENT_TYPE.FormUrlEncoded);
    expect(typeof req.request.body).toBe('string');
    expect(req.request.body).toContain('board=%5B%5B');
    req.flush({ status: SolveApiStatus.Solved });
  });

  it('does not touch GET requests', () => {
    const url = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.board}?difficulty=${GameDifficultyLevel.Easy}`;
    http.get(url).subscribe();
    const req = controller.expectOne(url);
    expect(req.request.headers.get(HTTP_HEADER.ContentType)).toBeNull();
    req.flush({ board: [] });
  });

  it('does not touch requests to other origins', () => {
    http.post(OTHER_ORIGIN_URL, { foo: 'bar' }).subscribe();
    const req = controller.expectOne(OTHER_ORIGIN_URL);
    expect(req.request.headers.get(HTTP_HEADER.ContentType)).toBeNull();
    expect(req.request.body).toEqual({ foo: 'bar' });
    req.flush({});
  });
});
