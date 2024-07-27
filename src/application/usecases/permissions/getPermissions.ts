import { QueryPermissionParams } from '../../../domain/dtos/permissions/findPermissions';
import { PermissionEntity } from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import { IReturnValueWithPagination } from '../../../domain/valueObjects/returnValue';
import IPermissionRepository from '../../repositories/iPermissionRepository';
import UseCaseInterface from '../protocols';
import setupPermissionsQuery from '../utils/setupPermissionsQuery';

export default class GetPermissions
  implements
    UseCaseInterface<
      QueryPermissionParams,
      IReturnValueWithPagination<PermissionEntity[] | null>
    >
{
  constructor(private readonly repository: IPermissionRepository) {}

  async execute(
    params: QueryPermissionParams
  ): Promise<IReturnValueWithPagination<PermissionEntity[] | null>> {
    const { options } = params;
    const query = setupPermissionsQuery(params.filter);

    const orderBy =
      options?.sort && Object.keys(options?.sort).length ? options?.sort : {};

    const withRoles = options?.withRoles && options?.withRoles === 'true';

    // Select and include cannot be used at same time, so if there is include, we want to delete select

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
          roles: withRoles ? { include: { role: true } } : false,
        },

        skip: skip,
        take: limit,
      });

      return {
        success: true,
        message: 'Permissions result',
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
