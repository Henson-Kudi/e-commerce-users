import {
  CreateUserGroupQuery,
  DeleteUserGroupQuery,
  FindUserGroupQuery,
  UpdateUserGroupQuery,
  UpsertUserGroupQuery,
  UserGroupsDbClient,
} from '../protocols';
import prisma from '../../database/postgres';
import { UserGroupEntity } from '../../../domain/entities';
import IUserGroupRepository from '../../../application/repositories/userGroupRepository';
import { Group, User } from '@prisma/client';

export default class UserGroupsRepository implements IUserGroupRepository {
  private readonly dbClient: UserGroupsDbClient = prisma.userGroup;

  update(data: UpdateUserGroupQuery): Promise<UserGroupEntity> {
    const updated = this.dbClient.update(data);
    return updated;
  }

  createUpsert(
    params: UpsertUserGroupQuery
  ): Promise<UserGroupEntity & { group?: Group; user?: User }> {
    return this.dbClient.upsert(params);
  }
  count(query: FindUserGroupQuery): Promise<number> {
    return this.dbClient.count({ where: query.where });
  }

  create(data: CreateUserGroupQuery): Promise<UserGroupEntity> {
    const created = this.dbClient.create(data);

    return created;
  }

  find(query: FindUserGroupQuery): Promise<UserGroupEntity[]> {
    const found = this.dbClient.findMany(query);

    return found;
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
    params: DeleteUserGroupQuery
  ): Promise<{ matchedCount: number }> {
    const deleted = await this.dbClient.deleteMany(params);
    return {
      matchedCount: deleted.count,
    };
  }
}
