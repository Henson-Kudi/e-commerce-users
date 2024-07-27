import { GroupsService } from '../../../../application/services/groupsService';
import { GroupEntity, UserEntity } from '../../../../domain/entities';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class AddUsersToGroup
  implements IContoller<IReturnValue<GroupEntity & { roles?: UserEntity[] }>>
{
  constructor(private readonly groupService: GroupsService) {}
  handle(
    request: RequestObject
  ): Promise<IReturnValue<GroupEntity & { users?: UserEntity[] }>> {
    return this.groupService.addUsersToGroup({
      ...request.body,
      actor: request.headers?.userId,
      groupId: request.params.id ?? request.body?.groupId,
    });
  }
}
