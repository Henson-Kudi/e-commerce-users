import { GroupQuery } from '../../../domain/dtos/groups/findGroups';
import { GroupEntity, RoleEntity, UserEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import { FindUniqueGroupQuery } from '../../../infrastructure/repositories/protocols';
import IGroupsRepository from '../../repositories/groupsRepository';
import UseCaseInterface from '../protocols';
import setupGroupsQuery from '../utils/setupGroupsQuery';

export default class GetGroup
  implements
    UseCaseInterface<
      Partial<Record<keyof Omit<GroupQuery, 'search'>, string>> & {
        id: string;
        withRoles?: boolean;
        withUsers: boolean;
      },
      IReturnValue<GroupEntity>
    >
{
  constructor(private readonly repository: IGroupsRepository) {}

  async execute(
    params: Partial<Record<keyof Omit<GroupQuery, 'search'>, string>> & {
      id: string;
      withRoles?: boolean;
      withUsers: boolean;
    }
  ): Promise<
    IReturnValue<GroupEntity & { roles?: RoleEntity[]; users?: UserEntity[] }>
  > {
    const query = setupGroupsQuery(
      params as unknown as GroupQuery
    ) as FindUniqueGroupQuery;

    const found = await this.repository.findOne({
      where: {
        ...query,
        id: params.id,
      },
      include: {
        roles: params.withRoles ? { include: { role: true } } : false,
        users: params?.withUsers ? { include: { user: true } } : false,
      },
    });

    if (!found) {
      return {
        success: false,
        data: null,
        message: 'Resource not found',
      };
    }

    return {
      success: true,
      data: found,
      message: 'Found resource',
    };
  }
}
