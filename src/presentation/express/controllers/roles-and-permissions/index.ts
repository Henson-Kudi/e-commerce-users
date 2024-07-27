import { PermissionService } from '../../../../application/services/permissionsService';
import { RoleService } from '../../../../application/services/roleService';
import messageBroker from '../../../../infrastructure/providers/messageBroker';
import AttachPermissionsToRole from './attachPermissionsToRole';
import CreatePermission from './createPermission';
import CreateRole from './createRole';
import DeleteRole from './deleteRole';
import GetPermission from './getPermission';
import GetPermissions from './getPermissions';
import GetRole from './getRole';
import GetRoles from './getRoles';
import RemovePermissions from './removePermissions';
import RemovePermissionsFromRole from './removePermissionsFromRole';
import UpdatePermission from './updatePermission';
import UpdateRole from './updateRole';

class RolesAndPermissionsController {
  private readonly rolesService: RoleService = new RoleService(messageBroker);
  private readonly permissionsService: PermissionService =
    new PermissionService(messageBroker);

  attachPermissionsToRole = new AttachPermissionsToRole(this.rolesService);

  removePermissionsFromRole = new RemovePermissionsFromRole(this.rolesService);

  createPermission = new CreatePermission(this.permissionsService);

  getPermission = new GetPermission(this.permissionsService);

  getPermissions = new GetPermissions(this.permissionsService);

  removePermissions = new RemovePermissions(this.permissionsService);

  updatePermission = new UpdatePermission(this.permissionsService);

  createRole = new CreateRole(this.rolesService);

  getRole = new GetRole(this.rolesService);

  getRoles = new GetRoles(this.rolesService);

  updateRole = new UpdateRole(this.rolesService);

  removeRole = new DeleteRole(this.rolesService);
}

export default new RolesAndPermissionsController();
