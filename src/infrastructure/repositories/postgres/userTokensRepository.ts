import prisma from '../../database/postgres';
import {
  CreateUserTokenQuery,
  FindUserTokenQuery,
  UpdateUserTokenQuery,
  UserTokenDeleteQuery,
  UserTokensDbClient,
} from '../protocols';
import { UserTokenEntity } from '../../../domain/entities';
import IUserTokensRepository from '../../../application/repositories/userTokensRepository';

export default class UserTokensRepository implements IUserTokensRepository {
  private readonly dbClient: UserTokensDbClient = prisma.userToken;

  update(data: UpdateUserTokenQuery): Promise<UserTokenEntity> {
    const updated = this.dbClient.update(data);
    return updated;
  }

  count(query: FindUserTokenQuery): Promise<number> {
    return this.dbClient.count({ where: query.where });
  }

  create(data: CreateUserTokenQuery): Promise<UserTokenEntity> {
    const created = this.dbClient.create(data);

    return created;
  }

  find(query: FindUserTokenQuery): Promise<UserTokenEntity[]> {
    const found = this.dbClient.findMany(query);

    return found;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.dbClient.delete({ where: { id: id } });
    return res ? true : false;
  }

  // Use this if you want to delete a user and all relational data of this user.
  async deleteMany(params: UserTokenDeleteQuery): Promise<{
    matchedCount: number;
  }> {
    const deleted = await this.dbClient.deleteMany(params);

    return {
      matchedCount: deleted.count,
    };
  }
}
