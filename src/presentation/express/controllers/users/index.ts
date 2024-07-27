import usersService from '../../../../application/services/usersService';
import AddRolesToUser from './addRolesToUser';
import ChangeUserPassword from './changeUserPassword';
import CreateUser from './createUserController';
import DeactivateAccount from './deactivateAccount';
import DeactivateMyAccount from './deactivateMyAccount';
import DeleteAccount from './deleteAccount';
import DeleteMyAccount from './deleteMyAccount';
import GetInvitations from './getInvitations';
import GetUser from './getUser';
import GetUsers from './getUsers';
import InviteUser from './inviteUsers';
import RemoveInvitation from './removeInvitation';
import RemoveRolesFromUser from './removeRolesFromUser';
import UpdateMyAccount from './updateMyAccount';
import UpdateUser from './updateUser';
import UpdateUserEmail from './updateUserEmail';
import UpdateUserPhone from './updateUserPhone';

class UsersController {
  private readonly userService = usersService;

  getUsers = new GetUsers(this.userService);
  getUser = new GetUser(this.userService);
  createUser = new CreateUser(this.userService);
  changeUserPassword = new ChangeUserPassword(this.userService);
  deactivateAccount = new DeactivateAccount(this.userService);
  deactivateMyAccount = new DeactivateMyAccount(this.userService);
  deleteAccount = new DeleteAccount(this.userService);
  deleteMyAccount = new DeleteMyAccount(this.userService);
  updateUser = new UpdateUser(this.userService); //this needs to be changed to a function that accepts all user fields
  updateUserEmail = new UpdateUserEmail(this.userService);
  updateUserPhone = new UpdateUserPhone(this.userService);
  addRolesToUser = new AddRolesToUser(this.userService);
  removeRolesFromUser = new RemoveRolesFromUser(this.userService);
  updateMyAccount = new UpdateMyAccount(this.userService);

  // Invitations
  inviteUser = new InviteUser(this.userService);
  getInvitations = new GetInvitations(this.userService);
  removeInvitation = new RemoveInvitation(this.userService);
}

export default new UsersController();
