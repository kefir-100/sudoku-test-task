export abstract class StorageProvider {
  abstract read<TValue>(key: string): TValue | null;
  abstract write<TValue>(key: string, value: TValue): void;
  abstract remove(key: string): void;
  abstract clear(): void;
}
