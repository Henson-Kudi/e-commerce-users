import IRepository from '.';
import { RoleEntity } from '../../domain/entities';
import {
  CreateRoleQuery,
  DeleteRoleQuery,
  FindRolesQuery,
  UpdateRoleQuery,
} from '../../infrastructure/repositories/protocols';

export default interface IRoleRepository
  extends IRepository<
    RoleEntity,
    CreateRoleQuery,
    FindRolesQuery,
    UpdateRoleQuery,
    DeleteRoleQuery
  > {
  softDelete(params: UpdateRoleQuery): Promise<RoleEntity>;
}
