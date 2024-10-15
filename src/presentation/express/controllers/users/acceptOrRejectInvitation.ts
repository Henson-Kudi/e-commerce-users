import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { UsersService } from '../../../../application/services/usersService';
import { InvitationEntity } from '../../../../domain/entities';

export default class AcceptInvitation
  implements IContoller<IReturnValue<InvitationEntity>>
{
  constructor(private readonly userService: UsersService) {}

  handle(request: RequestObject): Promise<IReturnValue<InvitationEntity>> {
    return this.userService.acceptOrRejectInvitation({
      ...request.body,
      actor: request.headers?.userId,
      accept: request.body.accept !== false,
    });
  }
}
