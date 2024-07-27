import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { UsersService } from '../../../../application/services/usersService';

export default class RemoveInvitation
  implements IContoller<IReturnValue<boolean>>
{
  constructor(private readonly userService: UsersService) {}

  handle(request: RequestObject): Promise<IReturnValue<boolean>> {
    return this.userService.deleteInvitation({
      filter: request.query,
      id: request.params.id,
    });
  }
}
