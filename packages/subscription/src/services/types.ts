export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  incrBy?(key: string, amount: number): Promise<void>;
  expire?(key: string, ttl: number): Promise<void>;
}
