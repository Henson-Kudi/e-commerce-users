import { GroupsService } from '../../../../application/services/groupsService';
import { GroupEntity } from '../../../../domain/entities';
import { IReturnValueWithPagination } from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class GetGroups
  implements IContoller<IReturnValueWithPagination<GroupEntity[] | null>>
{
  constructor(private readonly groupService: GroupsService) {}
  handle(
    request: RequestObject
  ): Promise<IReturnValueWithPagination<GroupEntity[] | null>> {
    return this.groupService.getGroups(request.query);
  }
}
