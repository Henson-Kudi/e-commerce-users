import { Request } from 'express';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import { AuthService } from '../../../../application/services/authService';
import { UserEntity } from '../../../../domain/entities';

export default class VerifyEmail
  implements IContoller<IReturnValue<UserEntity | null>>
{
  constructor(private readonly authService: AuthService) {}
  handle(request: Request): Promise<IReturnValue<UserEntity | null>> {
    return this.authService.verifyEmail({
      token: request.body.code,
      id: request.body.userId,
      email: request.body.email,
      deviceIp: request.headers.deviceIp?.toString(),
      userAgent: request.headers.userAgent?.toString(),
      deviceType: request.headers.deviceType?.toString(),
      os: request.headers.os?.toString(),
      browser: request.headers.browser?.toString(),
      location: request.headers.location?.toString(),
      isLoggedIn: request.headers.authorization?.toString() ? true : false,
    });
  }
}
