import IRepository from '.';
import {
  GroupEntity,
  GroupRoleEntity,
  RoleEntity,
} from '../../domain/entities';
import {
  CreateGroupRoleQuery,
  DeleteGroupRoleQuery,
  FindGroupRoleQuery,
  FindOneGroupRoleQuery,
  UpdateGroupRoleQuery,
  UpsertGroupRoleQuery,
} from '../../infrastructure/repositories/protocols';

export default interface IGroupRoleRepository
  extends IRepository<
    GroupRoleEntity,
    CreateGroupRoleQuery,
    FindGroupRoleQuery,
    UpdateGroupRoleQuery,
    DeleteGroupRoleQuery
  > {
  createUpsert(
    params: UpsertGroupRoleQuery
  ): Promise<GroupRoleEntity & { group?: GroupEntity; role?: RoleEntity }>;
  findUnique(query: FindOneGroupRoleQuery): Promise<GroupRoleEntity | null>;
}
