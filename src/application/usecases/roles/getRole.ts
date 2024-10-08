import { RoleQuery } from '../../../domain/dtos/roles/findRoles';
import { RoleEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IRoleRepository from '../../repositories/roleRepository';
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
        users: params.withUsers === true || params?.withUsers === 'true',
        groups: params.withGroups === true || params?.withGroups === 'true',
        permissions:
          params.withPermissions === true || params?.withPermissions === 'true',
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
