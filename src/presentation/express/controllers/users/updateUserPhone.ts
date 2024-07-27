import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { UsersService } from '../../../../application/services/usersService';
import {
  UserEntity,
  UserGroupEntity,
  UserRoleEntity,
  UserTokenEntity,
} from '../../../../domain/entities';

export default class UpdateUserPhone
  implements
    IContoller<
      IReturnValue<
        | (UserEntity & {
            roles?: UserRoleEntity[];
            groups?: UserGroupEntity[];
            tokens?: UserTokenEntity[];
          })
        | null
      >
    >
{
  constructor(private readonly userService: UsersService) {}

  handle(request: RequestObject): Promise<
    IReturnValue<
      | (UserEntity & {
          roles?: UserRoleEntity[];
          groups?: UserGroupEntity[];
          tokens?: UserTokenEntity[];
        })
      | null
    >
  > {
    return this.userService.updateUserPhone({
      ...(request.body ?? {}),
      id: request.params.id,
    });
  }
}
