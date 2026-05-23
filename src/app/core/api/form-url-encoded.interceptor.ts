import type { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { APP_CONFIG } from '../config/app-config';
import { HTTP_CONTENT_TYPE, HTTP_HEADER } from '../config/http-headers.config';
import { HTTP_METHOD } from '../config/http-method.config';
import { encodeFormUrlEncoded } from './encode-board.helper';
import type { RawBoard } from '../../models/raw-board';

export const formUrlEncodedInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  if (!req.url.startsWith(APP_CONFIG.api.baseUrl)) {
    return next(req);
  }
  if (req.method !== HTTP_METHOD.POST) {
    return next(req);
  }
  const body = req.body as Record<string, RawBoard> | null;
  const encodedBody = body ? encodeFormUrlEncoded(body) : null;
  const formReq = req.clone({
    body: encodedBody,
    setHeaders: { [HTTP_HEADER.ContentType]: HTTP_CONTENT_TYPE.FormUrlEncoded },
  });
  return next(formReq);
};
