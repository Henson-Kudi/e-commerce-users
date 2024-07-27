import { QueryRoleParams } from '../../../domain/dtos/roles/findRoles';
import { RoleEntity } from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import { IReturnValueWithPagination } from '../../../domain/valueObjects/returnValue';
import IRoleRepository from '../../repositories/RoleRepository';
import UseCaseInterface from '../protocols';
import setupRoleQuery from '../utils/setupRolesQuery';

export default class GetRoles
  implements
    UseCaseInterface<
      QueryRoleParams,
      IReturnValueWithPagination<RoleEntity[] | null>
    >
{
  constructor(private readonly repository: IRoleRepository) {}

  async execute(
    params: QueryRoleParams
  ): Promise<IReturnValueWithPagination<RoleEntity[] | null>> {
    const { options } = params;

    const query = setupRoleQuery(params.filter);

    const orderBy =
      options?.sort && Object.keys(options?.sort).length ? options?.sort : {};

    const includeQuery: {
      groups?: { [key: string]: unknown };
      users?: { [key: string]: unknown };
      permissions?: { [key: string]: unknown };
    } = {};

    const withUsers = options?.withUsers && options?.withUsers === 'true';
    const withGroups = options?.withGroups && options?.withGroups === 'true';
    const withPermissions =
      options?.withPermissions && options?.withPermissions === 'true';

    // Setup joints for roles and groups (if present)
    if (withUsers) {
      includeQuery.users = {
        include: { user: true },
      };
    }

    if (withGroups) {
      includeQuery.groups = {
        include: { group: true },
      };
    }

    if (withPermissions) {
      includeQuery.permissions = {
        permissions: {
          include: { permission: true },
        },
      };
    }

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
          users: withUsers ? { include: { user: true } } : false,
          groups: withGroups ? { include: { group: true } } : false,
          permissions: withPermissions
            ? { include: { permission: true } }
            : false,
        },

        skip: skip,
        take: limit,
      });

      return {
        success: true,
        message: 'Users result',
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
