import {
  FindRolePermissionQuery,
  UpdateRolePermissionQuery,
  RolePermissionsDbClient,
  DeleteRolePermissionQuery,
  CreateRolePermissionQuery,
  UpsertRolePermissionQuery,
} from '../protocols';
import prisma from '../../database/postgres';
import { RolePermissionEntity } from '../../../domain/entities';
import IRolePermissionRepository from '../../../application/repositories/iRolePermission';

export default class RolePermissionRepository
  implements IRolePermissionRepository
{
  private readonly dbClient: RolePermissionsDbClient = prisma.rolePermission;

  count(query: FindRolePermissionQuery): Promise<number> {
    return this.dbClient.count({ where: query.where });
  }

  softDelete(
    id: string,
    actor?: string
  ): Promise<{ id: string; roleId: string; permissionId: string }> {
    throw new Error(`Method not implemented. ${id}, ${actor}`);
  }

  update(data: UpdateRolePermissionQuery): Promise<RolePermissionEntity> {
    const updated = this.dbClient.update(data);
    return updated;
  }

  create(data: CreateRolePermissionQuery): Promise<RolePermissionEntity> {
    const created = this.dbClient.create(data);

    return created;
  }

  find(query: FindRolePermissionQuery): Promise<RolePermissionEntity[]> {
    const found = this.dbClient.findMany(query);

    return found;
  }

  // Use this if you want to delete a RolePermissionEntity and all relational data of this RolePermission.
  async delete(id: string): Promise<boolean> {
    const deleted = await this.dbClient.delete({
      where: {
        id: id,
      },
    });

    return deleted ? true : false;
  }

  async deleteMany(
    params: DeleteRolePermissionQuery
  ): Promise<{ matchedCount: number }> {
    const deleted = await this.dbClient.deleteMany(params);
    return {
      matchedCount: deleted.count,
    };
  }

  createUpsert(
    query: UpsertRolePermissionQuery
  ): Promise<RolePermissionEntity> {
    return this.dbClient.upsert(query);
  }
}
