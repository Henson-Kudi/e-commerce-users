import {
  PermissionQuery,
  QueryPermissionParams,
} from '../../domain/dtos/permissions/findPermissions';
import ICreatePermissionDTO from '../../domain/dtos/permissions/IcreatePremission';
import PermissionsRepository from '../../infrastructure/repositories/postgres/permissionsRepository';
import IMessageBroker from '../providers/messageBroker';
import CreatePermission from '../usecases/permissions/createPermission';
import GetPermission from '../usecases/permissions/getPermission';
import GetPermissions from '../usecases/permissions/getPermissions';
import RemovePermissions from '../usecases/permissions/removePermissions';
import UpdatePermission from '../usecases/permissions/updatePermission';

export class PermissionService {
  private readonly permsRep = new PermissionsRepository();

  constructor(private readonly messageBroker: IMessageBroker) {}

  createPermissions(params: {
    data: ICreatePermissionDTO[];
    createdBy: string;
  }) {
    return new CreatePermission(this.permsRep, this.messageBroker).execute(
      params
    );
  }

  getPermission(
    params: Omit<PermissionQuery, 'search'> & {
      id: string;
      withRoles?: boolean | 'true' | 'false';
    }
  ) {
    return new GetPermission(this.permsRep).execute(params);
  }

  getPermissions(params: QueryPermissionParams) {
    return new GetPermissions(this.permsRep).execute(params);
  }

  removePermissions(params: {
    filter: Omit<PermissionQuery, 'search'>;
    data: {
      ids: string[];
      actor: string;
      hardDelete?: boolean;
    };
  }) {
    return new RemovePermissions(this.permsRep, this.messageBroker).execute(
      params
    );
  }

  updatePermission(params: {
    filter: Omit<PermissionQuery, 'search'> & {
      id: string;
    };
    data: {
      updatedBy: string;
      permission?: string;
      isActive?: boolean;
      roles?: string[];
    };
  }) {
    return new UpdatePermission(this.permsRep, this.messageBroker).execute(
      params
    );
  }
}
