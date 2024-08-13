import { QueryUserParams } from '../../../domain/dtos/user/IFindUser';
import {
  UserEntity,
  GroupEntity,
  RoleEntity,
  TokenEntity,
} from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import { IReturnValueWithPagination } from '../../../domain/valueObjects/returnValue';
import { DefaultUserFieldsToSelect } from '../../../utils/constants/user';
import IUserRepository from '../../repositories/userRepository';
import UseCaseInterface from '../protocols';
import setupUserQuery from '../utils/setupUserQuery';

export default class GetUsers
  implements
    UseCaseInterface<
      QueryUserParams,
      IReturnValueWithPagination<
        | (UserEntity & {
            tokens?: TokenEntity[];
            groups?: GroupEntity[];
            roles?: RoleEntity[];
          })[]
        | null
      >
    >
{
  constructor(private readonly repository: IUserRepository) {}

  async execute(params: QueryUserParams): Promise<
    IReturnValueWithPagination<
      | (UserEntity & {
          tokens?: TokenEntity[];
          groups?: GroupEntity[];
          roles?: RoleEntity[];
        })[]
      | null
    >
  > {
    const { options } = params;
    const query = setupUserQuery(params.filter);

    const orderBy =
      options?.sort && Object.keys(options?.sort).length ? options?.sort : {};

    const withRoles =
      options?.withRoles === true || options?.withRoles === 'true';
    const withGroups =
      options?.withGroups === true || options?.withGroups === 'true';
    const withTokens =
      options?.withTokens === true || options?.withTokens === 'true';

    // Pagination setup
    const limit = options?.limit ? options?.limit : 10;
    const page = options?.page ? options?.page : 1;
    const skip = (page - 1) * limit;

    const total = await this.repository.count({ where: query });

    try {
      const found = await this.repository.find({
        where: query,
        // include: Object.keys(includeQuery).length ? includeQuery : undefined,
        orderBy: {
          ...orderBy,
        },
        select:
          !withRoles && !withGroups && !withTokens
            ? options?.selectFields ?? DefaultUserFieldsToSelect
            : undefined,
        include:
          !withRoles || !withGroups || !withTokens
            ? {
                roles: withRoles,
                groups: withGroups,

                tokens: withTokens,
              }
            : undefined,
        skip: skip,
        take: limit,
      });

      return {
        success: true,
        message: 'Users result',
        data: {
          data: found?.map((item) => ({
            ...item,
            password: null,
          })),
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
