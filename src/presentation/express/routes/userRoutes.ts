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
  .delete(
    verifyPermission(ResourceAccessType.Delete, 'invitations', [
      StaticRoles.Editor,
    ]),
    augmentRequestQuery('invitor'),
    removeInvitation
  );

// Routes for a user to perform actions for his/her account
router
  .route('/account')
  .put(updateMyAccount)
  .delete(deactivateMyAccount)
  .get(getMyDetails);
router.route('/account/phone').put(updateUserPhone);
router.route('/account/email').put(updateUserEmail);
router.route('/account/credentials').put(changeUserPassword);
router.route('/account/delete').delete(deleteMyAccount);

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
