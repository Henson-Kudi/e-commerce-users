import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import { AuthService } from '../../../../application/services/authService';
import RequestObject from '../../../../utils/types/request';
import {
  UserEntity,
  GroupEntity,
  RoleEntity,
  TokenEntity,
} from '../../../../domain/entities';

export default class Login
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
  constructor(private readonly authService: AuthService) {}

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
    const data = {
      ...request.body,
      device: request.device!,
      ip: request.ip!,
    };

    return this.authService.login(data);
  }
}
