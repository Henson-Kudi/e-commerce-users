import { IReturnValueWithPagination } from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { UsersService } from '../../../../application/services/usersService';
import { InvitationEntity } from '../../../../domain/entities';

export default class GetInvitations
  implements IContoller<IReturnValueWithPagination<InvitationEntity[]>>
{
  constructor(private readonly userService: UsersService) {}

  handle(
    request: RequestObject
  ): Promise<IReturnValueWithPagination<InvitationEntity[]>> {
    return this.userService.getInvitations(request.query);
  }
}
