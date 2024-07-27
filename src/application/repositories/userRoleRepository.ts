import IRepository from '.';
import { RoleEntity, UserEntity, UserRoleEntity } from '../../domain/entities';
import {
  CreateUserRoleQuery,
  DeleteUserRoleQuery,
  FindUserRoleQuery,
  UpdateUserRoleQuery,
  UpsertUserRoleQuery,
} from '../../infrastructure/repositories/protocols';

export default interface IUserRoleRepository
  extends IRepository<
    UserRoleEntity,
    CreateUserRoleQuery,
    FindUserRoleQuery,
    UpdateUserRoleQuery,
    DeleteUserRoleQuery
  > {
  createUpsert(
    params: UpsertUserRoleQuery
  ): Promise<UserRoleEntity & { role?: RoleEntity; user?: UserEntity }>;
}
