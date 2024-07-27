import { QueryUserParams } from '../../../domain/dtos/user/IFindUser';
import {
  UserEntity,
  UserGroupEntity,
  UserRoleEntity,
  UserTokenEntity,
} from '../../../domain/entities';
import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
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
            tokens?: UserTokenEntity[];
            groups?: UserGroupEntity[];
            roles?: UserRoleEntity[];
          })[]
        | null
      >
    >
{
  constructor(private readonly repository: IUserRepository) {}

  async execute(params: QueryUserParams): Promise<
    IReturnValueWithPagination<
      | (UserEntity & {
          tokens?: UserTokenEntity[];
          groups?: UserGroupEntity[];
          roles?: UserRoleEntity[];
        })[]
      | null
    >
  > {
    const { options } = params;
    const query = setupUserQuery(params.filter);

    const includeQuery: {
      groups?: { [key: string]: unknown };
      roles?: { [key: string]: unknown };
      tokens?: { [key: string]: unknown };
    } = {};

    const orderBy =
      options?.sort && Object.keys(options?.sort).length ? options?.sort : {};

    const withRoles = options?.withRoles && options?.withRoles === 'true';
    const withGroups = options?.withGroups && options?.withGroups === 'true';
    const withTokens = options?.withTokens && options?.withTokens === 'true';

    // Setup joints for roles and groups (if present)
    if (withRoles) {
      includeQuery.roles = {
        include: { role: true },
      };
    }

    if (withGroups) {
      includeQuery.groups = {
        include: { group: true },
      };
    }

    if (withTokens) {
      includeQuery.tokens = {
        tokens: {
          where: {
            expireAt: {
              gte: new Date(),
            },
            type: {
              not: TokenType.OTP,
            },
          },
        },
      };
    }

    // Select and include cannot be used at same time, so if there is include, we want to delete select

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
        select: !Object.keys(includeQuery).length
          ? options?.selectFields ?? DefaultUserFieldsToSelect
          : undefined,
        include: Object.keys(includeQuery).length
          ? {
              roles: params?.filter?.roles
                ? {
                    where: { role: { name: { in: params.filter.roles } } },
                  }
                : withRoles ?? false,
              groups: params?.filter?.groups
                ? {
                    where: { group: { name: { in: params.filter.groups } } },
                  }
                : withGroups ?? false,

              tokens: withTokens
                ? {
                    where: {
                      expireAt: { gte: new Date() },
                      type: { not: TokenType.OTP },
                    },
                  }
                : false,
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
