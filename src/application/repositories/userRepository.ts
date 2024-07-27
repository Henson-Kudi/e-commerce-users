import IRepository from '.';
import {
  UserEntity,
  UserGroupEntity,
  UserRoleEntity,
  UserTokenEntity,
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
    UserEntity & {
      roles?: UserRoleEntity[];
      groups?: UserGroupEntity[];
      tokens?: UserTokenEntity[];
    },
    CreateUserQuery,
    FindUsersQuery,
    UpdateUserQuery,
    DeleteUserQuery
  > {
  findUnique(query: FindOneUserQuery): Promise<
    | (UserEntity & {
        roles?: UserRoleEntity[];
        tokens?: UserTokenEntity[];
        groups?: UserGroupEntity[];
      })
    | null
  >;
}
