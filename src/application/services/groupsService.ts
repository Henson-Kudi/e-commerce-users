import {
  GroupQuery,
  QueryGroupParams,
} from '../../domain/dtos/groups/findGroups';
import ICreateGroupDTO from '../../domain/dtos/groups/ICreateGroup';
import messageBroker from '../../infrastructure/providers/messageBroker';
import GroupsRepository from '../../infrastructure/repositories/postgres/groupsRepository';
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

  addRolesToGroup(params: { roles: string[]; actor: string; groupId: string }) {
    return new AddRolesToGroup(this.repository, {
      messageBroker: this.messenger,
    }).execute(params);
  }

  addUsersToGroup(params: {
    members: string[];
    actor: string;
    groupId: string;
  }) {
    return new AddMembersToGroup(this.repository, {
      messageBroker: this.messenger,
    }).execute(params);
  }

  createGroup(data: ICreateGroupDTO) {
    return new CreateGroup(this.repository, this.messenger).execute(data);
  }

  deleteGroups(params: {
    filter: Omit<GroupQuery, 'search'> & {
      id: string | string[];
    };
    options: {
      hardDelete?: boolean;
      actor: string;
    };
  }) {
    return new RemoveGroups(this.repository, this.messenger).execute(params);
  }

  getGroup(
    params: Partial<Record<keyof Omit<GroupQuery, 'search'>, string>> & {
      id: string;
      withRoles?: boolean;
      withUsers?: boolean;
    }
  ) {
    return new GetGroup(this.repository).execute(params);
  }

  getGroups(params: QueryGroupParams) {
    return new GetGroups(this.repository).execute(params);
  }

  updateGroup(data: {
    filter: Omit<GroupQuery, 'search'> & {
      id: string;
    };
    data: {
      updatedBy: string;
      name?: string;
      description?: string;
    };
  }) {
    return new UpdateGroup(this.repository, this.messenger).execute(data);
  }

  deleteRolesFromGroup(params: {
    filter: GroupQuery & {
      id: string;
    };
    data: {
      roles: string[];
      actor?: string;
    };
  }) {
    return new RemoveRolesFromGroup(this.repository, {
      messageBroker: this.messenger,
    }).execute(params);
  }

  deleteMembersFromGroup(params: {
    filter: GroupQuery & {
      id: string;
    };
    data: {
      users: string[];
      actor?: string;
    };
  }) {
    return new RemoveMembersFromGroup(this.repository, {
      messageBroker: this.messenger,
    }).execute(params);
  }
}

export default new GroupsService();
