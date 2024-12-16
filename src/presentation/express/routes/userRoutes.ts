import { Router } from 'express';
import register from './handlers/users/register';
import updateUser from './handlers/users/updateUser';
import deactivateAccount from './handlers/users/deactivateAccount';
import getUser from './handlers/users/getUser';
import getUsers from './handlers/users/getUsers';
import updateUserPhone from './handlers/users/updatePhone';
import updateUserEmail from './handlers/users/updateEmail';
import changeUserPassword from './handlers/users/changePassword';
import addRolesToUser from './handlers/users/addRolesToUser';
import removeRolesFromUser from './handlers/users/removeRolesFromUser';
import authenticateRequest from '../middlewares/authenticateRequest';
import verifyPermission from '../middlewares/verifyPermission';
import { ResourceAccessType, StaticRoles } from '../../../domain/enums';
import augmentRequestQuery from '../middlewares/augmentFilterQuery';
import updateMyAccount from './handlers/users/updateMyAccount';
import deactivateMyAccount from './handlers/users/deactivateMyAccount';
import getMyDetails from './handlers/users/getMyDetails';
import deleteMyAccount from './handlers/users/deleteMyAccount';
import getInvitations from './handlers/users/getInvitations';
import inviteUser from './handlers/users/inviteUser';
import removeInvitation from './handlers/users/removeInvitations';
import acceptOrRejectInvitation from './handlers/users/acceptOrRejectInvitation';
import countUsers from './handlers/users/countUsers';

const router = Router();

const resource = 'users';

// User registration is not  authenticated
router.post('/', register);

// Authenticate all other routes
router.use(authenticateRequest());

// User
router.get(
  '/',
  verifyPermission(ResourceAccessType.Read, resource, [
    StaticRoles.Viewer,
    StaticRoles.Editor,
  ]),
  augmentRequestQuery('filter.invitedById'),
  getUsers
);

router.get(
  '/count',
  verifyPermission(ResourceAccessType.Read, resource, [
    StaticRoles.Viewer,
    StaticRoles.Editor,
  ]),
  countUsers
);

//  User Invitations
router
  .route('/invitation')
  .post(
    verifyPermission(ResourceAccessType.Write, 'invitations', [
      StaticRoles.Editor,
    ]),
    inviteUser
  )
  .get(
    verifyPermission(ResourceAccessType.Read, 'invitations', [
      StaticRoles.Viewer,
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('invitor'),
    getInvitations
  );

router
  .route('/invitation/:id')
  .post(
    verifyPermission(ResourceAccessType.Write, 'invitations', [
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('invitor'),
    acceptOrRejectInvitation
  )
  .delete(
    verifyPermission(ResourceAccessType.Delete, 'invitations', [
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('invitor'),
    removeInvitation
  );

// Routes for a user to perform actions for his/her me
router
  .route('/me')
  .put(updateMyAccount)
  .delete(deactivateMyAccount)
  .get(getMyDetails);
router.route('/me/phone').put(updateUserPhone);
router.route('/me/email').put(updateUserEmail);
router.route('/me/credentials').put(changeUserPassword);
router.route('/me/delete').delete(deleteMyAccount);

// User roles
router.post(
  '/:id/remove-roles', // Remove roles from a user. :id refers to user id
  verifyPermission(ResourceAccessType.Delete, 'user-roles', [
    StaticRoles.Editor,
  ]),
  augmentRequestQuery('filter.createdBy'),
  removeRolesFromUser
);
router.post(
  '/:id/add-roles', // Adds roles to a user. :id refers to user id
  verifyPermission(ResourceAccessType.Write, 'user-roles', [
    StaticRoles.Editor,
  ]),
  augmentRequestQuery('filter.createdBy'),
  addRolesToUser
);

// Routes for another user to access or perform actions on other user accounts
router
  .route('/:id')
  .put(
    verifyPermission(ResourceAccessType.Update, resource, [StaticRoles.Editor]),
    augmentRequestQuery('filter.invitedById'),
    updateUser
  )
  .delete(
    verifyPermission(ResourceAccessType.Delete, resource, [StaticRoles.Editor]),
    augmentRequestQuery('filter.invitedById'),
    deactivateAccount
  )
  .get(
    verifyPermission(ResourceAccessType.Read, resource, [
      StaticRoles.Viewer,
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('filter.invitedById'),
    getUser
  );

export default router;
