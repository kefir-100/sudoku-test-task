export const NormalizedErrorKind = {
  Network: 'network',
  Server: 'server',
  Storage: 'storage',
  Unknown: 'unknown',
} as const;
export type NormalizedErrorKind = (typeof NormalizedErrorKind)[keyof typeof NormalizedErrorKind];

export interface NormalizedError {
  readonly kind: NormalizedErrorKind;
  readonly message: string;
  readonly httpStatus?: number;
}
