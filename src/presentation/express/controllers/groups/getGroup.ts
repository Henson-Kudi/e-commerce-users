import { GroupsService } from '../../../../application/services/groupsService';
import { GroupEntity } from '../../../../domain/entities';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class GetGroup implements IContoller<IReturnValue<GroupEntity>> {
  constructor(private readonly groupService: GroupsService) {}
  handle(request: RequestObject): Promise<IReturnValue<GroupEntity>> {
    return this.groupService.getGroup({
      ...(request.query ?? {}),
      id: request.params?.id,
    });
  }
}
