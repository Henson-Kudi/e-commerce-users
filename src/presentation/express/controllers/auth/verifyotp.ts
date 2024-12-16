import { Request } from 'express';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import { AuthService } from '../../../../application/services/authService';
import { TokenEntity, UserEntity } from '../../../../domain/entities';

export default class VerifyOtp implements IContoller<IReturnValue<unknown>> {
  constructor(private readonly authService: AuthService) {}
  async handle(request: Request): Promise<
    IReturnValue<{
      valid: boolean;
      user?: UserEntity & { tokens?: TokenEntity[] };
    }>
  > {
    const data = {
      id: request.body.userId?.toString(),
      email: request.body.email?.toString(),
      phone: request.body.phone?.toString(),
      token: request.body.code?.toString(),
      isLoggedIn: request.headers.authorization?.toString() ? true : false,
      deviceIp: request.headers.deviceIp?.toString(),
      userAgent: request.headers.userAgent?.toString(),
      deviceType: request.headers.deviceType?.toString(),
      os: request.headers.os?.toString(),
      browser: request.headers.browser?.toString(),
      location: request.headers.location?.toString(),
    };

    const response = await this.authService.authenticate2FA(data);

    return {
      ...response,
      data: {
        ...response.data,
        valid: response.success,
      },
    };
  }
}
