import { QueryGroupParams } from '../../../domain/dtos/groups/findGroups';
import { GroupEntity, RoleEntity, UserEntity } from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import { IReturnValueWithPagination } from '../../../domain/valueObjects/returnValue';
import IGroupsRepository from '../../repositories/groupsRepository';
import UseCaseInterface from '../protocols';
import setupGroupsQuery from '../utils/setupGroupsQuery';

export default class GetGroups
  implements
    UseCaseInterface<
      QueryGroupParams,
      IReturnValueWithPagination<GroupEntity[] | null>
    >
{
  constructor(private readonly repository: IGroupsRepository) {}

  async execute(params: QueryGroupParams): Promise<
    IReturnValueWithPagination<
      | (GroupEntity & {
          roles?: RoleEntity[];
          users?: UserEntity[];
        })[]
      | null
    >
  > {
    const { options } = params;
    const query = setupGroupsQuery(params.filter);

    const orderBy =
      options?.sort && Object.keys(options?.sort).length ? options?.sort : {};

    const withRoles = options?.withRoles && options?.withRoles === 'true';
    const withUsers = options?.withUsers && options?.withUsers === 'true';

    // Pagination setup
    const limit = options?.limit ? options?.limit : 10;
    const page = options?.page ? options?.page : 1;
    const skip = (page - 1) * limit;

    const total = await this.repository.count({ where: query });

    try {
      const found = await this.repository.find({
        where: query,
        orderBy: {
          ...orderBy,
        },

        include: {
          roles: withRoles,
          users: withUsers,
        },

        skip: skip,
        take: limit,
      });

      return {
        success: true,
        message: 'Groups result',
        data: {
          data: found,
          limit,
          page,
          total,
        },
      };
    } catch (err) {
      const error = err as Error;
      const response: IReturnValueWithPagination<null> = {
        success: false,
        message: error.message,
        error: new ErrorClass(
          error.message,
          ResponseCodes.ServerError,
          null,
          Errors.ServerError
        ),
        data: {
          data: null,
          limit,
          page,
          total: 0,
        },
      };

      return response;
    }
  }
}
