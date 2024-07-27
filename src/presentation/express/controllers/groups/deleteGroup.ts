import { GroupsService } from '../../../../application/services/groupsService';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class DeleteGroup
  implements IContoller<IReturnValue<{ matchedCount: number }>>
{
  constructor(private readonly groupService: GroupsService) {}
  handle(
    request: RequestObject
  ): Promise<IReturnValue<{ matchedCount: number }>> {
    return this.groupService.deleteGroups({
      filter: {
        ...(request.query ?? {}),
        id: request.params?.id,
      },
      options: {
        actor: request.headers!.userId!,
        hardDelete: request.params?.id ? true : request.body?.hardDelete,
      },
    });
  }
}
