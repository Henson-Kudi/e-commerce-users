import IRepository from '.';
import { GroupEntity } from '../../domain/entities';
import {
  CreateGroupQuery,
  DeleteGroupQuery,
  FindGroupQuery,
  FindUniqueGroupQuery,
  UpdateGroupQuery,
  UpdateManyGroupsQuery,
} from '../../infrastructure/repositories/protocols';

export default interface IGroupsRepository
  extends IRepository<
    GroupEntity,
    CreateGroupQuery,
    FindGroupQuery,
    UpdateGroupQuery,
    DeleteGroupQuery
  > {
  softDeleteMany(
    params: UpdateManyGroupsQuery
  ): Promise<{ matchedCount: number }>;
  findOne(params: FindUniqueGroupQuery): Promise<GroupEntity | null>;
}
