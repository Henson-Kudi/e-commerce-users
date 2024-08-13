import IRepository from '.';
import {
  GroupEntity,
  PermissionEntity,
  RoleEntity,
  UserEntity,
  UserWithRelations,
} from '../../domain/entities';
import {
  CreateUserQuery,
  DeleteUserQuery,
  FindOneUserQuery,
  FindUsersQuery,
  UpdateUserQuery,
} from '../../infrastructure/repositories/protocols';

export default interface IUserRepository
  extends IRepository<
    UserEntity,
    CreateUserQuery,
    FindUsersQuery,
    UpdateUserQuery,
    DeleteUserQuery
  > {
  findUnique(query: FindOneUserQuery): Promise<
    | (UserEntity & {
        groups?: (GroupEntity & {
          roles?: (RoleEntity & { permissions?: PermissionEntity[] })[];
        })[];
        roles?: (RoleEntity & { permissions?: PermissionEntity[] })[];
      })
    | null
  >;
  findUserWithRolesAndGroups(
    query: FindOneUserQuery
  ): Promise<UserWithRelations | null>;
}
