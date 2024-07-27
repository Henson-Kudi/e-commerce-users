import {
  CreateUserQuery,
  DeleteUserQuery,
  FindOneUserQuery,
  FindUsersQuery,
  UpdateUserQuery,
  UsersDbClient,
} from '../protocols';
import prisma from '../../database/postgres';
import {
  UserEntity,
  UserGroupEntity,
  UserRoleEntity,
  UserTokenEntity,
} from '../../../domain/entities';
import IUserRepository from '../../../application/repositories/userRepository';

export default class UsersRepository implements IUserRepository {
  private readonly dbClient: UsersDbClient = prisma.user;

  update(data: UpdateUserQuery): Promise<UserEntity> {
    const updated = this.dbClient.update(data);
    return updated;
  }

  create(data: CreateUserQuery): Promise<UserEntity> {
    const created = this.dbClient.create(data);

    return created;
  }

  find(query: FindUsersQuery): Promise<
    (
      | UserEntity
      | (UserEntity & {
          roles?: UserRoleEntity[];
          tokens?: UserTokenEntity[];
          groups?: UserGroupEntity[];
        })
    )[]
  > {
    const found = this.dbClient.findMany(query);

    return found;
  }
  findUnique(query: FindOneUserQuery): Promise<
    | (UserEntity & {
        roles?: UserRoleEntity[];
        tokens?: UserTokenEntity[];
        groups?: UserGroupEntity[];
      })
    | null
  > {
    const found = this.dbClient.findUnique(query);

    return found;
  }

  count(query: FindUsersQuery): Promise<number> {
    return this.dbClient.count({
      where: query.where,
    });
  }

  softDelete(id: string, actor?: string): Promise<UserEntity> {
    const updatedUser = this.dbClient.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
        isDeleted: true,
        isActive: false,
        deletedById: actor,
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

  async deleteMany(params: DeleteUserQuery): Promise<{ matchedCount: number }> {
    const deleted = await this.dbClient.deleteMany(params);
    return {
      matchedCount: deleted.count,
    };
  }
}
