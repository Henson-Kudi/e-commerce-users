import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import { AuthService } from '../../../../application/services/authService';
import ErrorClass from '../../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../../domain/enums';
import RequestObject from '../../../../utils/types/request';
import {
  UserEntity,
  GroupEntity,
  RoleEntity,
  TokenEntity,
} from '../../../../domain/entities';
import { RefreshTokenName } from '../../../../utils/constants/tokens';

export default class RefreshAccessToken
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
    const cookies = request.cookies;
    // We're saying refresh token can come from request body or cookies header
    let refreshToken =
      cookies?.[RefreshTokenName] || request?.body?.refreshToken;

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
      token: refreshToken,
    };

    // if (!data.token || !data.ip || !data.device) {
    //   return new Promise((res) => {
    //     res({
    //       success: false,
    //       error: new ErrorClass(
    //         Errors.UnAuthorised,
    //         ResponseCodes.UnAuthorised,
    //         null,
    //         Errors.UnAuthorised
    //       ),
    //       message: Errors.UnAuthorised,
    //     });
    //   });
    // }

    return this.authService.refreshAccessToken({
      token: data.token,
    });
  }
}
