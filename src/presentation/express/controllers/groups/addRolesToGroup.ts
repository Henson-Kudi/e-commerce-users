import { GroupsService } from '../../../../application/services/groupsService';
import { GroupEntity, RoleEntity } from '../../../../domain/entities';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class AddRolesToGroup
  implements IContoller<IReturnValue<GroupEntity & { roles?: RoleEntity[] }>>
{
  constructor(private readonly groupService: GroupsService) {}
  handle(
    request: RequestObject
  ): Promise<IReturnValue<GroupEntity & { roles?: RoleEntity[] }>> {
    return this.groupService.addRolesToGroup({
      ...request.body,
      actor: request.headers?.userId,
      groupId: request.params.id ?? request.body?.groupId,
    });
  }
}
