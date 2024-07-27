import { GroupsService } from '../../../../application/services/groupsService';
import AddRolesToGroup from './addRolesToGroup';
import AddUsersToGroup from './addUsersToGroup';
import CreateGroup from './createGroup';
import DeleteGroup from './deleteGroup';
import DeleteMembersFromGroup from './deleteMembersFromGroup';
import DeleteRolesFromGroup from './deleteRolesFromGroup';
import GetGroup from './getGroup';
import GetGroups from './getGroups';
import UpdateGroup from './updateGroup';

class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  addRolesToGroup = new AddRolesToGroup(this.groupsService);
  addUsersToGroup = new AddUsersToGroup(this.groupsService);
  createGroup = new CreateGroup(this.groupsService);
  deleteGroup = new DeleteGroup(this.groupsService);
  getGroup = new GetGroup(this.groupsService);
  getGroups = new GetGroups(this.groupsService);
  updateGroup = new UpdateGroup(this.groupsService);
  deleteRolesFromGroup = new DeleteRolesFromGroup(this.groupsService);
  deleteMembersFromGroup = new DeleteMembersFromGroup(this.groupsService);
}

export default new GroupsController(new GroupsService());
