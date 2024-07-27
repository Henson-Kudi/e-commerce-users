import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import { AuthService } from '../../../../application/services/authService';
import ErrorClass from '../../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../../domain/enums';
import RequestObject from '../../../../utils/types/request';
import {
  UserEntity,
  UserGroupEntity,
  UserRoleEntity,
  UserTokenEntity,
} from '../../../../domain/entities';
import { RefreshTokenName } from '../../../../utils/constants/tokens';

export default class RefreshAccessToken
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
  constructor(private readonly authService: AuthService) {}

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
    const cookies = request.cookies;
    const refreshToken = cookies[RefreshTokenName];

    if (!refreshToken) {
      return new Promise((res) => {
        res({
          success: false,
          error: new ErrorClass(
            Errors.UnAuthorised,
            ResponseCodes.UnAuthorised,
            null,
            Errors.UnAuthorised
          ),
          message: Errors.UnAuthorised,
        });
      });
    }

    const data = {
      device: request.device,
      ip: request.ip,
      token: refreshToken,
    };

    if (!data.token || !data.ip || !data.device) {
      return new Promise((res) => {
        res({
          success: false,
          error: new ErrorClass(
            Errors.UnAuthorised,
            ResponseCodes.UnAuthorised,
            null,
            Errors.UnAuthorised
          ),
          message: Errors.UnAuthorised,
        });
      });
    }

    return this.authService.refreshAccessToken({
      device: data.device,
      ip: data.ip,
      token: data.token,
    });
  }
}
