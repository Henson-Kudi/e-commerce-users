import {
  CreateRoleQuery,
  DeleteRoleQuery,
  FindOneRoleQuery,
  FindRolesQuery,
  RolesDbClient,
  UpdateRoleQuery,
} from '../protocols';
import prisma from '../../database/postgres';
import { RoleEntity } from '../../../domain/entities';
import IRoleRepository from '../../../application/repositories/roleRepository';

export default class RolesRepository implements IRoleRepository {
  private readonly dbClient: RolesDbClient = prisma.role;

  count(query: FindRolesQuery): Promise<number> {
    return this.dbClient.count({
      where: query.where,
    });
  }

  update(data: UpdateRoleQuery): Promise<RoleEntity> {
    const updated = this.dbClient.update(data);
    return updated;
  }

  create(query: CreateRoleQuery): Promise<RoleEntity> {
    const created = this.dbClient.create(query);

    return created;
  }

  find(query: FindRolesQuery): Promise<RoleEntity[]> {
    const found = this.dbClient.findMany(query);

    return found;
  }

  findUnique(query: FindOneRoleQuery): Promise<RoleEntity | null> {
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

  softDelete(params: UpdateRoleQuery): Promise<RoleEntity> {
    return this.dbClient.update(params);
  }

  async deleteMany(params: DeleteRoleQuery): Promise<{ matchedCount: number }> {
    const deleted = await this.dbClient.deleteMany(params);
    return {
      matchedCount: deleted.count,
    };
  }
}
