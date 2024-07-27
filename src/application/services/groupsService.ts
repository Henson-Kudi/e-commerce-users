import messageBroker from '../../infrastructure/providers/messageBroker';
import GroupRolesRepository from '../../infrastructure/repositories/postgres/groupRolesRepository';
import GroupsRepository from '../../infrastructure/repositories/postgres/groupsRepository';
import UserGroupsRepository from '../../infrastructure/repositories/postgres/userGroupsRepository';
import AddRolesToGroup from '../usecases/groups/addRolesToGroup';
import AddMembersToGroup from '../usecases/groups/addUsersToGroup';
import CreateGroup from '../usecases/groups/createGroup';
import RemoveGroups from '../usecases/groups/deleteGroups';
import GetGroup from '../usecases/groups/getGroup';
import GetGroups from '../usecases/groups/getGroups';
import RemoveMembersFromGroup from '../usecases/groups/removeMembersFromGroup';
import RemoveRolesFromGroup from '../usecases/groups/removeRolesFromGroup';
import UpdateGroup from '../usecases/groups/updateGroup';

export class GroupsService {
  private readonly repository = new GroupsRepository();
  private readonly messenger = messageBroker;
  private readonly groupRolesRepository = new GroupRolesRepository();
  private readonly userGroupsRepository = new UserGroupsRepository();

  addRolesToGroup = new AddRolesToGroup(this.groupRolesRepository, {
    messageBroker: this.messenger,
  }).execute;

  addUsersToGroup = new AddMembersToGroup(this.userGroupsRepository, {
    messageBroker: this.messenger,
  }).execute;

  createGroup = new CreateGroup(this.repository, this.messenger).execute;

  deleteGroups = new RemoveGroups(this.repository, this.messenger).execute;

  getGroup = new GetGroup(this.repository).execute;

  getGroups = new GetGroups(this.repository).execute;

  updateGroup = new UpdateGroup(this.repository, this.messenger).execute;

  deleteRolesFromGroup = new RemoveRolesFromGroup(this.groupRolesRepository, {
    messageBroker: this.messenger,
  }).execute;

  deleteMembersFromGroup = new RemoveMembersFromGroup(
    this.userGroupsRepository,
    { messageBroker: this.messenger }
  ).execute;
}

export default new GroupsService();
