import './localstorage-shim';
import { provideZonelessChangeDetection } from '@angular/core';

export default [provideZonelessChangeDetection()];
