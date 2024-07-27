import IRepository from '.';
import {
  GroupEntity,
  UserEntity,
  UserGroupEntity,
} from '../../domain/entities';
import {
  CreateUserGroupQuery,
  DeleteUserGroupQuery,
  FindUserGroupQuery,
  UpdateUserGroupQuery,
  UpsertUserGroupQuery,
} from '../../infrastructure/repositories/protocols';

export default interface IUserGroupRepository
  extends IRepository<
    UserGroupEntity,
    CreateUserGroupQuery,
    FindUserGroupQuery,
    UpdateUserGroupQuery,
    DeleteUserGroupQuery
  > {
  createUpsert(
    params: UpsertUserGroupQuery
  ): Promise<UserGroupEntity & { group?: GroupEntity; user?: UserEntity }>;
}
