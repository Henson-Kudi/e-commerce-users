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
import { OTP_Types } from '../../../../domain/enums';

export default class Login
  implements
    IContoller<
      IReturnValue<
        | (UserEntity & {
            roles?: RoleEntity[];
            groups?: GroupEntity[];
            tokens?: TokenEntity[];
            refreshToken?: string;
            accessToken?: string;
          })
        | { email?: string; userId?: string; phone?: string }
        | null
      > & {
        redirect?: boolean;
        redirectType?: OTP_Types;
      }
    >
{
  constructor(private readonly authService: AuthService) {}

  handle(request: RequestObject): Promise<
    IReturnValue<
      | (UserEntity & {
          roles?: RoleEntity[];
          groups?: GroupEntity[];
          tokens?: TokenEntity[];
          accessToken: string;
          refreshToken: string;
        })
      | { email?: string; userId?: string; phone?: string }
      | null
    > & {
      redirect?: boolean;
      redirectType?: OTP_Types;
    }
  > {
    const deviceIp = request.headers.deviceIp;
    const userAgent = request.headers.userAgent;

    // Parse User-Agent to extract details
    const deviceType = request.headers.deviceType;
    const os = request.headers.os;
    const browser = request.headers.browser;

    const data = {
      ...request.body,
      deviceIp,
      deviceType,
      os,
      browser,
      userAgent,
    };

    return this.authService.login(data);
  }
}
