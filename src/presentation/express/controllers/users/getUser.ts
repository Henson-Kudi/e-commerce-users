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

export default class GetUser
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
    return this.userService.getUser({
      ...(request.query ?? {}),
      id: request.params.id,
      withGroups: request.query?.withGroups === 'true',
      withRoles: request.query?.withRoles === 'true',
      withTokens: request.query?.withTokens === 'true',
    });
  }
}
