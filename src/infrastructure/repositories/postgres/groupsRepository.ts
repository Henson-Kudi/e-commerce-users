import {
  CreateGroupQuery,
  DeleteGroupQuery,
  FindGroupQuery,
  FindUniqueGroupQuery,
  GroupsDbClient,
  UpdateGroupQuery,
  UpdateManyGroupsQuery,
} from '../protocols';
import prisma from '../../database/postgres';
import { GroupEntity } from '../../../domain/entities';
import IGroupsRepository from '../../../application/repositories/groupsRepository';

export default class GroupsRepository implements IGroupsRepository {
  private readonly dbClient: GroupsDbClient = prisma.group;

  async softDeleteMany(
    params: UpdateManyGroupsQuery
  ): Promise<{ matchedCount: number }> {
    const updated = await this.dbClient.updateMany(params);
    return { matchedCount: updated.count };
  }

  count(query: FindGroupQuery): Promise<number> {
    return this.dbClient.count({ where: query.where });
  }

  update(data: UpdateGroupQuery): Promise<GroupEntity> {
    const updated = this.dbClient.update(data);
    return updated;
  }

  create(data: CreateGroupQuery): Promise<GroupEntity> {
    const created = this.dbClient.create(data);

    return created;
  }

  find(query: FindGroupQuery): Promise<GroupEntity[]> {
    const found = this.dbClient.findMany(query);

    return found;
  }

  findOne(params: FindUniqueGroupQuery): Promise<GroupEntity | null> {
    return this.dbClient.findFirst(params);
  }

  softDelete(id: string): Promise<GroupEntity> {
    const updatedUser = this.dbClient.update({
      where: {
        id: id,
      },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });

    return updatedUser;
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
    params: DeleteGroupQuery
  ): Promise<{ matchedCount: number }> {
    const deleted = await this.dbClient.deleteMany(params);
    return {
      matchedCount: deleted.count,
    };
  }
}
