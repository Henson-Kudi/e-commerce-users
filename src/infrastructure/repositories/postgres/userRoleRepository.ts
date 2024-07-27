import {
  CreateUserRoleQuery,
  DeleteUserRoleQuery,
  FindUserRoleQuery,
  UpdateUserRoleQuery,
  UpsertUserRoleQuery,
  UserRolesDbClient,
} from '../protocols';
import prisma from '../../database/postgres';
import { UserRoleEntity } from '../../../domain/entities';
import IUserRoleRepository from '../../../application/repositories/userRoleRepository';
import { Role, User } from '@prisma/client';

export default class UserRolesRepository implements IUserRoleRepository {
  private readonly dbClient: UserRolesDbClient = prisma.userRole;

  update(data: UpdateUserRoleQuery): Promise<UserRoleEntity> {
    const updated = this.dbClient.update(data);
    return updated;
  }

  createUpsert(
    params: UpsertUserRoleQuery
  ): Promise<UserRoleEntity & { role?: Role; user?: User }> {
    return this.dbClient.upsert(params);
  }

  count(query: FindUserRoleQuery): Promise<number> {
    return this.dbClient.count({ where: query.where });
  }

  create(data: CreateUserRoleQuery): Promise<UserRoleEntity> {
    const created = this.dbClient.create(data);

    return created;
  }

  find(query: FindUserRoleQuery): Promise<UserRoleEntity[]> {
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
    params: DeleteUserRoleQuery
  ): Promise<{ matchedCount: number }> {
    const deleted = await this.dbClient.deleteMany(params);
    return {
      matchedCount: deleted.count,
    };
  }
}
