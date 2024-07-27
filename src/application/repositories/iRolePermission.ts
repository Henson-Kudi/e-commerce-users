import IRepository from '.';
import { RolePermissionEntity } from '../../domain/entities';
import {
  CreateRolePermissionQuery,
  DeleteRolePermissionQuery,
  FindRolePermissionQuery,
  UpdateRolePermissionQuery,
  UpsertRolePermissionQuery,
} from '../../infrastructure/repositories/protocols';

export default interface IRolePermissionRepository
  extends IRepository<
    RolePermissionEntity,
    CreateRolePermissionQuery,
    FindRolePermissionQuery,
    UpdateRolePermissionQuery,
    DeleteRolePermissionQuery
  > {
  createUpsert(query: UpsertRolePermissionQuery): Promise<RolePermissionEntity>;
}
