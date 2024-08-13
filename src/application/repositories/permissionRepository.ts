import IRepository from '.';
import { PermissionEntity } from '../../domain/entities';
import {
  CreatePermissionQuery,
  CreateUpsertPermissionQuery,
  DeletePermissionQuery,
  FindPermissionQuery,
  UpdatePermissionQuery,
} from '../../infrastructure/repositories/protocols';

export default interface IPermissionRepository
  extends IRepository<
    PermissionEntity,
    CreatePermissionQuery,
    FindPermissionQuery,
    UpdatePermissionQuery,
    DeletePermissionQuery
  > {
  softDeleteMany(params: {
    ids: string[];
    actor: string;
  }): Promise<{ matchedCount: number }>;

  softDelete(params: { id: string; actor: string }): Promise<PermissionEntity>;

  createUpsert(data: CreateUpsertPermissionQuery): Promise<PermissionEntity>;
}
