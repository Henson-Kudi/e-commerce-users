import IRepository from '.';
import {
  UserEntity,
  GroupEntity,
  RoleEntity,
  TokenEntity,
} from '../../domain/entities';
import {
  CreateTokenQuery,
  FindTokenQuery,
  UpdateTokenQuery,
  DeleteTokenQuery,
} from '../../infrastructure/repositories/protocols';

export default interface IUserTokensRepository
  extends IRepository<
    TokenEntity & {
      user?: UserEntity & {
        groups?: GroupEntity[];
        roles?: RoleEntity[];
      };
    },
    CreateTokenQuery,
    FindTokenQuery,
    UpdateTokenQuery,
    DeleteTokenQuery
  > {}
