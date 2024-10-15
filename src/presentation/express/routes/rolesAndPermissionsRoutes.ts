import { Router } from 'express';
import getRoles from './handlers/roles-and-permissions/getRoles';
import createRole from './handlers/roles-and-permissions/createRole';
import updateRole from './handlers/roles-and-permissions/updateRole';
import removeRole from './handlers/roles-and-permissions/removeRole';
import getRole from './handlers/roles-and-permissions/getRole';
import getPermission from './handlers/roles-and-permissions/getPermission';
import getPermissions from './handlers/roles-and-permissions/getPermissions';
import createPermission from './handlers/roles-and-permissions/createPermission';
import updatePermission from './handlers/roles-and-permissions/updatePermission';
import removePermissions from './handlers/roles-and-permissions/removePermissions';
import attachPermissionsToRole from './handlers/roles-and-permissions/attachPermissionsToRole';
import removePermissionsFromRole from './handlers/roles-and-permissions/removePermissionsFromRole';
import authenticateRequest from '../middlewares/authenticateRequest';
import verifyPermission from '../middlewares/verifyPermission';
import { ResourceAccessType, StaticRoles } from '../../../domain/enums';
import augmentRequestQuery from '../middlewares/augmentFilterQuery';

const router = Router();

// Authenticate all routes
router.use(authenticateRequest());

const permissions = 'permissions';
const roles = 'roles';

// Permissions
router
  .route('/permissions')
  .get(
    verifyPermission(ResourceAccessType.Read, permissions, [
      StaticRoles.Viewer,
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('createdBy'),
    getPermissions
  )
  .post(
    verifyPermission(ResourceAccessType.Write, permissions, [
      StaticRoles.Editor,
    ]),
    createPermission
  );

router
  .route('/permissions/:id')
  .put(
    verifyPermission(ResourceAccessType.Update, permissions, [
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('filter.createdBy'),
    updatePermission
  )
  .delete(
    verifyPermission(ResourceAccessType.Delete, permissions, [
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('filter.createdBy'),
    removePermissions
  )
  .get(
    verifyPermission(ResourceAccessType.Read, permissions, [
      StaticRoles.Viewer,
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('createdBy'),
    getPermission
  );

// Role-Permissions
router
  .route('/:id/add-permissions') //id refers to role id
  .post(
    verifyPermission(ResourceAccessType.Write, 'role-permissions', [
      StaticRoles.Editor,
    ]),
    attachPermissionsToRole
  );

router
  .route('/:id/remove-permissions') //id refers to role i
  .post(
    verifyPermission(ResourceAccessType.Delete, 'role-permissions', [
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('filter.createdBy'),
    removePermissionsFromRole
  );

// Roles
router
  .route('/')
  .get(
    verifyPermission(ResourceAccessType.Read, roles, [
      StaticRoles.Viewer,
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('filter.createdBy'),
    getRoles
  )
  .post(
    verifyPermission(ResourceAccessType.Write, roles, [StaticRoles.Editor]),
    createRole
  );

router
  .route('/:id')
  .put(
    verifyPermission(ResourceAccessType.Update, roles, [StaticRoles.Editor]),
    augmentRequestQuery('filter.createdBy'),
    updateRole
  )
  .delete(
    verifyPermission(ResourceAccessType.Delete, roles, [StaticRoles.Editor]),
    augmentRequestQuery('filter.createdBy'),
    removeRole
  )
  .get(
    verifyPermission(ResourceAccessType.Read, roles, [
      StaticRoles.Viewer,
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('filter.createdBy'),
    getRole
  );

export default router;
