import type { NormalizedError } from '../../models/normalized-error';

export type ApiResult<TData> =
  | { readonly data: TData; readonly error: null }
  | { readonly data: null; readonly error: NormalizedError };

export class ApiResultFactory {
  static success<TData>(data: TData): ApiResult<TData> {
    return { data, error: null };
  }

  static failure<TData>(error: NormalizedError): ApiResult<TData> {
    return { data: null, error };
  }
}
