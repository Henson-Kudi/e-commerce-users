import { Router } from 'express';
import createGroup from './handlers/groups/createGroup';
import getGroups from './handlers/groups/getGroups';
import updateGroup from './handlers/groups/updateGroup';
import getGroup from './handlers/groups/getGroup';
import deleteGroup from './handlers/groups/deleteGroup';
import addRolesToGroup from './handlers/groups/addRolesToGroup';
import addUsersToGroup from './handlers/groups/addUsersToGroup';
import verifyPermission from '../middlewares/verifyPermission';
import authenticateRequest from '../middlewares/authenticateRequest';
import { ResourceAccessType, StaticRoles } from '../../../domain/enums';
import augmentRequestQuery from '../middlewares/augmentFilterQuery';

const groupRoutes = Router();

const resource = 'groups';

// Authenticate all routes
groupRoutes.use(authenticateRequest());

groupRoutes
  .route('/')
  .post(
    verifyPermission(ResourceAccessType.Write, resource, [StaticRoles.Editor]),
    createGroup
  )
  .get(
    verifyPermission(ResourceAccessType.Read, resource, [
      StaticRoles.Viewer,
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('filter.createdBy'),
    getGroups
  );

groupRoutes
  .route('/:id')
  .put(
    verifyPermission(ResourceAccessType.Update, resource, [StaticRoles.Editor]),
    augmentRequestQuery('filter.createdBy'),
    updateGroup
  )
  .get(
    verifyPermission(ResourceAccessType.Read, resource, [
      StaticRoles.Viewer,
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('createdBy'),
    getGroup
  )
  .delete(
    verifyPermission(ResourceAccessType.Delete, resource, [StaticRoles.Editor]),
    augmentRequestQuery('filter.createdBy'),
    deleteGroup
  );

// Group roles
groupRoutes
  .route('/group-roles/:id') // id refers to group id
  .post(
    verifyPermission(ResourceAccessType.Write, 'group-roles', [
      StaticRoles.Editor,
    ]),
    addRolesToGroup
  );

//  Group users
groupRoutes
  .route('/group-users/:id') // id refers to group id
  .post(
    verifyPermission(ResourceAccessType.Write, 'group-users', [
      StaticRoles.Editor,
    ]),
    addUsersToGroup
  );

// Needs more routes. Check whatsapp

export default groupRoutes;
