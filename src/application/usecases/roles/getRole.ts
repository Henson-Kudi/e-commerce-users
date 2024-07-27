import { RoleQuery } from '../../../domain/dtos/roles/findRoles';
import { RoleEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IRoleRepository from '../../repositories/RoleRepository';
import UseCaseInterface from '../protocols';
import setupRoleQuery from '../utils/setupRolesQuery';

export default class GetRole
  implements
    UseCaseInterface<
      Omit<RoleQuery, 'search'> & {
        id: string;
        withUsers?: boolean | 'true' | 'false';
        withGroups?: boolean | 'true' | 'false';
        withPermissions?: boolean | 'true' | 'false';
      },
      IReturnValue<RoleEntity>
    >
{
  constructor(private readonly repository: IRoleRepository) {}

  async execute(
    params: Omit<RoleQuery, 'search'> & {
      id: string;
      withUsers?: boolean | 'true' | 'false';
      withGroups?: boolean | 'true' | 'false';
      withPermissions?: boolean | 'true' | 'false';
    }
  ): Promise<IReturnValue<RoleEntity>> {
    const query = setupRoleQuery(params);

    const found = await this.repository.find({
      where: query,
      include: {
        users:
          params.withUsers && params?.withUsers === 'true'
            ? { include: { user: true } }
            : false,
        groups:
          params.withGroups && params?.withGroups === 'true'
            ? { include: { group: true } }
            : false,
        permissions:
          params.withPermissions && params?.withPermissions === 'true'
            ? { include: { permission: true } }
            : false,
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
