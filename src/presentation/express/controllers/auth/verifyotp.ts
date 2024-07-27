import { Request } from 'express';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import { AuthService } from '../../../../application/services/authService';

export default class VerifyOtp
  implements IContoller<IReturnValue<{ valid: boolean }>>
{
  constructor(private readonly authService: AuthService) {}
  handle(request: Request): Promise<IReturnValue<{ valid: boolean }>> {
    const data = {
      userId: request.body.userId,
      email: request.body.email,
      phone: request.body.phone,
      code: request.body.code,
    };

    return this.authService.verifyotp(data);
  }
}
