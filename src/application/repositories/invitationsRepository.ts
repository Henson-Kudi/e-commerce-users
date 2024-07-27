import IRepository from '.';
import { InvitationEntity, UserEntity } from '../../domain/entities';
import {
  CreateInvitationQuery,
  DeleteInvitationQuery,
  FindInvitationQuery,
  FindOneInvitationQuery,
  UpdateInvitationQuery,
  UpsertInvitationQuery,
} from '../../infrastructure/repositories/protocols';

export default interface IInvitationsRepository
  extends IRepository<
    InvitationEntity,
    CreateInvitationQuery,
    FindInvitationQuery,
    UpdateInvitationQuery,
    DeleteInvitationQuery
  > {
  createUpsert(
    params: UpsertInvitationQuery
  ): Promise<InvitationEntity & { invitor?: UserEntity }>;
  findUnique(
    query: FindOneInvitationQuery
  ): Promise<(InvitationEntity & { invitor?: UserEntity }) | null>;
}
