import { PermissionQuery } from '../../../domain/dtos/permissions/findPermissions';
import { PermissionEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IPermissionRepository from '../../repositories/permissionRepository';
import UseCaseInterface from '../protocols';
import setupPermissionsQuery from '../utils/setupPermissionsQuery';

export default class GetPermission
  implements
    UseCaseInterface<
      {
        id: string;
        withRoles?: boolean | 'true' | 'false';
      },
      IReturnValue<PermissionEntity>
    >
{
  constructor(private readonly repository: IPermissionRepository) {}

  async execute(
    params: Omit<PermissionQuery, 'search'> & {
      id: string;
      withRoles?: boolean | 'true' | 'false';
    }
  ): Promise<IReturnValue<PermissionEntity>> {
    const query = setupPermissionsQuery(params);

    const found = await this.repository.find({
      where: query,
      include: {
        roles: params.withRoles === true || params.withRoles === 'true',
      },
    });

    if (!found[0]) {
      return {
        success: false,
        data: null,
        message: 'Resource not found',
      };
    }

    return {
      success: true,
      data: found[0],
      message: 'Found resource',
    };
  }
}
