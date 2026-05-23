import { type ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { formUrlEncodedInterceptor } from './core/api/form-url-encoded.interceptor';
import { ErrorHandlerService } from './core/errors/error-handler.service';
import { LocalStorageService } from './core/storage/local-storage.service';
import { StorageProvider } from './core/storage/storage-provider';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([formUrlEncodedInterceptor])),
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
    {
      provide: StorageProvider,
      useExisting: LocalStorageService,
    },
  ],
};
