import prisma from '../../database/postgres';
import {
  CreateTokenQuery,
  FindTokenQuery,
  UpdateTokenQuery,
  DeleteTokenQuery,
  TokensDbClient,
} from '../protocols';
import { TokenEntity } from '../../../domain/entities';
import ITokenTokensRepository from '../../../application/repositories/userTokensRepository';

export default class UserTokensRepository implements ITokenTokensRepository {
  private readonly dbClient: TokensDbClient = prisma.token;

  update(data: UpdateTokenQuery): Promise<TokenEntity> {
    const updated = this.dbClient.update(data);
    return updated;
  }

  count(query: FindTokenQuery): Promise<number> {
    return this.dbClient.count({ where: query.where });
  }

  create(data: CreateTokenQuery): Promise<TokenEntity> {
    const created = this.dbClient.create(data);

    return created;
  }

  find(query: FindTokenQuery): Promise<TokenEntity[]> {
    const found = this.dbClient.findMany(query);

    return found;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.dbClient.delete({ where: { id: id } });
    return res ? true : false;
  }

  // Use this if you want to delete a Token and all relational data of this Token.
  async deleteMany(params: DeleteTokenQuery): Promise<{
    matchedCount: number;
  }> {
    const deleted = await this.dbClient.deleteMany(params);

    return {
      matchedCount: deleted.count,
    };
  }
}
