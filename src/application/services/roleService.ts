import { QueryRoleParams, RoleQuery } from '../../domain/dtos/roles/findRoles';
import ICreateRoleDTO from '../../domain/dtos/roles/ICreateRole';
import messageBroker from '../../infrastructure/providers/messageBroker';
import RolesRepository from '../../infrastructure/repositories/postgres/rolesRepository';
import IMessageBroker from '../providers/messageBroker';
import AttachPermissionsToRole from '../usecases/roles/attachPermissionsToRole';
import CreateRole from '../usecases/roles/createRole';
import DeleteRole from '../usecases/roles/deleteRole';
import GetRole from '../usecases/roles/getRole';
import GetRoles from '../usecases/roles/getRoles';
import RemovePermissionsFromRole from '../usecases/roles/removePermissionsFromRole';
import UpdateRole from '../usecases/roles/updateRole';

export class RoleService {
  private readonly repo = new RolesRepository();

  constructor(private readonly messageBroker: IMessageBroker) {}

  createRole(params: ICreateRoleDTO) {
    return new CreateRole(this.repo, {
      messageBroker: this.messageBroker,
    }).execute(params);
  }

  public getRole(
    params: Omit<RoleQuery, 'search'> & {
      id: string;
      withUsers?: boolean | 'true' | 'false';
      withGroups?: boolean | 'true' | 'false';
      withPermissions?: boolean | 'true' | 'false';
    }
  ) {
    return new GetRole(this.repo).execute(params);
  }

  public getRoles(params: QueryRoleParams) {
    return new GetRoles(this.repo).execute(params);
  }

  public updateRole(params: {
    filter: Omit<RoleQuery, 'search'> & {
      id: string;
    };
    data: {
      name?: string;
      description?: string;
      actor: string;
    };
  }) {
    return new UpdateRole(this.repo, this.messageBroker).execute(params);
  }

  public deleteRole(
    params: Omit<RoleQuery, 'search'> & {
      id: string;
      actor: string;
      hardDelete?: boolean;
    }
  ) {
    return new DeleteRole(this.repo, this.messageBroker).execute(params);
  }

  attachPermissionsToRole(data: {
    permissions: string[];
    actor: string;
    roleId: string;
  }) {
    return new AttachPermissionsToRole(this.repo, this.messageBroker).execute(
      data
    );
  }

  removePermissionsFromRole(params: {
    filter: RoleQuery & {
      id: string;
    };
    data: {
      permissions: string[];
      actor: string;
    };
  }) {
    return new RemovePermissionsFromRole(this.repo, {
      messageBroker: this.messageBroker,
    }).execute(params);
  }
}

export default new RoleService(messageBroker);
