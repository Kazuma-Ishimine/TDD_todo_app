import type { AppEntity } from '../models/app';

/**
 * Input type for creating an app.
 */
export type CreateAppInput = { name: string };
/**
 * Input for retrieving an app.
 */
export type GetAppInput = { appId: string };
/**
 * Input for updating an app.
 */
export type UpdateAppInput = { appId: string; name?: string };
/**
 * Input for deleting an app.
 */
export type DeleteAppInput = { appId: string };

/**
 * Use case interface for app operations.
 */
export interface AppUsecase {
  create(input: CreateAppInput): Promise<AppEntity>;
  list(): Promise<AppEntity[]>;
  get(input: GetAppInput): Promise<AppEntity>;
  update(input: UpdateAppInput): Promise<AppEntity>;
  delete(input: DeleteAppInput): Promise<AppEntity>;
}
