import { GroupsService } from '../../../../application/services/groupsService';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class DeleteMembersFromGroup
  implements
    IContoller<
      IReturnValue<{
        matchedCount: number;
      }>
    >
{
  constructor(private readonly groupService: GroupsService) {}
  handle(request: RequestObject): Promise<
    IReturnValue<{
      matchedCount: number;
    }>
  > {
    return this.groupService.deleteMembersFromGroup({
      filter: {
        ...(request.query ?? {}),
        groups: request.params.id ?? request.body?.groupId,
      },
      data: {
        ...request.body,
        actor: request.headers?.userId,
      },
    });
  }
}
