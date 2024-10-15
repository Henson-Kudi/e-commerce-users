import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { UsersService } from '../../../../application/services/usersService';
import {
  UserEntity,
  GroupEntity,
  RoleEntity,
  TokenEntity,
} from '../../../../domain/entities';

export default class CreateUser
  implements
    IContoller<
      IReturnValue<
        | (UserEntity & {
            roles?: RoleEntity[];
            groups?: GroupEntity[];
            tokens?: TokenEntity[];
          })
        | null
      >
    >
{
  constructor(private readonly userService: UsersService) {}

  handle(request: RequestObject): Promise<
    IReturnValue<
      | (UserEntity & {
          roles?: RoleEntity[];
          groups?: GroupEntity[];
          tokens?: TokenEntity[];
        })
      | null
    >
  > {
    // When a user is registering, we don't want them to have roles or groups.
    // Groups can be gotten only by accepting an invitation or added manually by an authorised user
    return this.userService.createUser({
      ...request.body,
      roles: undefined,
      groups: undefined,
    });
  }
}
