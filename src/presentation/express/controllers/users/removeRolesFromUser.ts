import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { UsersService } from '../../../../application/services/usersService';
import { UserEntity } from '../../../../domain/entities';

export default class RemoveUserRoles
  implements IContoller<IReturnValue<UserEntity>>
{
  constructor(private readonly userService: UsersService) {}

  handle(request: RequestObject): Promise<IReturnValue<UserEntity>> {
    return this.userService.removeRolesFromUser({
      filter: {
        ...(request.query ?? {}),
        users: request.params.id,
      },
      data: {
        ...request.body,
        actor: request.headers?.userId,
      },
    });
  }
}
