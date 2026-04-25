import type { AppEntity } from '../models/app';

/**
 * Interface for app persistence operations.
 */
export interface AppRepository {
  save(app: AppEntity): Promise<void>;
  listActive(): Promise<AppEntity[]>;
  findActiveById(id: string): Promise<AppEntity | null>;
  existsActiveByName(name: string, excludeId?: string): Promise<boolean>;
}
