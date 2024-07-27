import {
  CreatePermissionQuery,
  CreateUpsertPermissionQuery,
  DeletePermissionQuery,
  FindPermissionQuery,
  PermissionsDbClient,
  UpdatePermissionQuery,
} from '../protocols';
import prisma from '../../database/postgres';
import { PermissionEntity } from '../../../domain/entities';
import IPermissionRepository from '../../../application/repositories/iPermissionRepository';
import { PermissionRegex } from '../../../utils/constants/permissions';
import moment from 'moment';

export default class PermissionsRepository implements IPermissionRepository {
  private readonly dbClient: PermissionsDbClient = prisma.permission;

  count(query: FindPermissionQuery): Promise<number> {
    return this.dbClient.count({
      where: query.where,
    });
  }

  update(data: UpdatePermissionQuery): Promise<PermissionEntity> {
    const updated = this.dbClient.update(data);
    return updated;
  }

  create(data: CreatePermissionQuery): Promise<PermissionEntity> {
    if (!PermissionRegex.test(data.data.permission)) {
      throw new Error('Invalid permission format');
    }

    const created = this.dbClient.create(data);

    return created;
  }

  createUpsert(data: CreateUpsertPermissionQuery): Promise<PermissionEntity> {
    return this.dbClient.upsert(data);
  }

  find(query: FindPermissionQuery): Promise<PermissionEntity[]> {
    const found = this.dbClient.findMany(query);

    return found;
  }

  softDelete(params: { id: string; actor: string }): Promise<PermissionEntity> {
    const updatedUser = this.dbClient.update({
      where: {
        id: params.id,
      },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: moment().toDate(),
        deletedById: params.actor,
      },
    });

    return updatedUser;
  }

  async softDeleteMany(params: {
    ids: string[];
    actor: string;
  }): Promise<{ matchedCount: number }> {
    const updatedUser = await this.dbClient.updateMany({
      where: {
        id: { in: params.ids },
      },
      data: {
        isDeleted: true,
        isActive: false,
        deletedById: params.actor,
        deletedAt: moment().toDate(),
      },
    });

    return {
      matchedCount: updatedUser.count,
    };
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
    params: DeletePermissionQuery
  ): Promise<{ matchedCount: number }> {
    const deleted = await this.dbClient.deleteMany(params);
    return {
      matchedCount: deleted.count,
    };
  }
}
