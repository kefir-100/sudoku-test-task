import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
  name: 'coalesceEmpty',
  standalone: true,
  pure: true,
})
export class CoalesceEmptyPipe implements PipeTransform {
  transform(value: number): string {
    return value === 0 ? '' : String(value);
  }
}
