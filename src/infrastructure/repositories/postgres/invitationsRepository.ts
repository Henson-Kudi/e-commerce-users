import { Invitation, User } from '@prisma/client';
import IInvitationsRepository from '../../../application/repositories/invitationsRepository';
import prisma from '../../database/postgres';
import {
  UpsertInvitationQuery,
  FindOneInvitationQuery,
  CreateInvitationQuery,
  FindInvitationQuery,
  UpdateInvitationQuery,
  DeleteInvitationQuery,
} from '../protocols';

export default class InvitationsRepository implements IInvitationsRepository {
  private readonly dbClient = prisma.invitation;

  createUpsert(
    params: UpsertInvitationQuery
  ): Promise<Invitation & { invitor?: User }> {
    return this.dbClient.upsert(params);
  }
  findUnique(
    query: FindOneInvitationQuery
  ): Promise<(Invitation & { invitor?: User }) | null> {
    return this.dbClient.findUnique(query);
  }
  create(
    data: CreateInvitationQuery
  ): Promise<Invitation & { invitor?: User }> {
    return this.dbClient.create(data);
  }
  find(
    query: FindInvitationQuery
  ): Promise<(Invitation & { invitor?: User })[]> {
    return this.dbClient.findMany(query);
  }
  update(
    data: UpdateInvitationQuery
  ): Promise<Invitation & { invitor?: User }> {
    return this.dbClient.update(data);
  }
  count(query: FindInvitationQuery): Promise<number> {
    return this.dbClient.count({ where: query.where });
  }
  async delete(id: string): Promise<boolean> {
    const deleted = await this.dbClient.delete({ where: { id } });
    return deleted ? true : false;
  }
  async deleteMany(
    params: DeleteInvitationQuery
  ): Promise<{ matchedCount: number }> {
    const deleted = await this.dbClient.deleteMany(params);
    return {
      matchedCount: deleted.count,
    };
  }
}
