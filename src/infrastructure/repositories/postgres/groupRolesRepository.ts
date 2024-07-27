import {
  FindGroupRoleQuery,
  UpdateGroupRoleQuery,
  GroupRolesDbClient,
  DeleteGroupRoleQuery,
  CreateGroupRoleQuery,
  UpsertGroupRoleQuery,
  FindOneGroupRoleQuery,
} from '../protocols';
import prisma from '../../database/postgres';
import {
  GroupEntity,
  GroupRoleEntity,
  RoleEntity,
} from '../../../domain/entities';
import IGroupRoleRepository from '../../../application/repositories/groupRolesRepository';

export default class GroupRolesRepository implements IGroupRoleRepository {
  private readonly dbClient: GroupRolesDbClient = prisma.groupRole;

  update(data: UpdateGroupRoleQuery): Promise<GroupRoleEntity> {
    const updated = this.dbClient.update(data);
    return updated;
  }

  count(query: FindGroupRoleQuery): Promise<number> {
    return this.dbClient.count({ where: query.where });
  }

  createUpsert(
    params: UpsertGroupRoleQuery
  ): Promise<GroupRoleEntity & { group?: GroupEntity; role?: RoleEntity }> {
    return this.dbClient.upsert(params);
  }

  create(data: CreateGroupRoleQuery): Promise<GroupRoleEntity> {
    const created = this.dbClient.create(data);

    return created;
  }

  find(query: FindGroupRoleQuery): Promise<GroupRoleEntity[]> {
    const found = this.dbClient.findMany(query);

    return found;
  }

  findUnique(query: FindOneGroupRoleQuery): Promise<GroupRoleEntity | null> {
    return this.dbClient.findUnique(query);
  }

  // Use this if you want to delete a user and all relational data of this user.
  async delete(id: string): Promise<boolean> {
    const deleted = await this.dbClient.delete({
      where: {
        id: id,
      },
    });

    return deleted ? true : false;
  }

  async deleteMany(
    params: DeleteGroupRoleQuery
  ): Promise<{ matchedCount: number }> {
    const deleted = await this.dbClient.deleteMany(params);
    return {
      matchedCount: deleted.count,
    };
  }
}
