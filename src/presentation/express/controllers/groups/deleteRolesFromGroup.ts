import { GroupsService } from '../../../../application/services/groupsService';
import { GroupEntity } from '../../../../domain/entities';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class DeleteRolesFromGroup
  implements IContoller<IReturnValue<GroupEntity>>
{
  constructor(private readonly groupService: GroupsService) {}
  handle(request: RequestObject): Promise<IReturnValue<GroupEntity>> {
    return this.groupService.deleteRolesFromGroup({
      filter: {
        ...(request.query ?? {}),
        id: request.params.id ?? request.body?.groupId,
      },
      data: {
        ...request.body,
        actor: request.headers?.userId,
      },
    });
  }
}
