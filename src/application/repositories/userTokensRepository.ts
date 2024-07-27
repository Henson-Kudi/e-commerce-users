import IRepository from '.';
import {
  UserEntity,
  UserGroupEntity,
  UserRoleEntity,
  UserTokenEntity,
} from '../../domain/entities';
import {
  CreateUserTokenQuery,
  FindUserTokenQuery,
  UpdateUserTokenQuery,
  UserTokenDeleteQuery,
} from '../../infrastructure/repositories/protocols';

export default interface IUserTokensRepository
  extends IRepository<
    UserTokenEntity & {
      user?: UserEntity & {
        groups?: UserGroupEntity[];
        roles?: UserRoleEntity[];
      };
    },
    CreateUserTokenQuery,
    FindUserTokenQuery,
    UpdateUserTokenQuery,
    UserTokenDeleteQuery
  > {}
