import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { RoleEntity, UserEntity } from '../../../../domain/entities';
import { UsersService } from '../../../../application/services/usersService';

export default class AddRolesToUser
  implements IContoller<IReturnValue<UserEntity & { roles?: RoleEntity[] }>>
{
  constructor(private readonly userService: UsersService) {}

  handle(
    request: RequestObject
  ): Promise<IReturnValue<UserEntity & { roles?: RoleEntity[] }>> {
    return this.userService.addRolesToUser({
      ...request.body,
      actor: request.headers?.userId,
      userId: request.params.id ?? request.body?.userId,
    });
  }
}
