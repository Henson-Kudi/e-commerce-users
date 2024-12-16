import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import { AuthService } from '../../../../application/services/authService';
import RequestObject from '../../../../utils/types/request';
import { OTP_Types } from '../../../../domain/enums';

export default class RequestOtp
  implements IContoller<IReturnValue<{ userId: string; sent: boolean }>>
{
  constructor(private readonly authService: AuthService) {}
  handle(
    request: RequestObject
  ): Promise<IReturnValue<{ userId: string; sent: boolean }>> {
    const data = {
      userId: request.body.userId,
      email: request.body.email,
      phone: request.body.phone,
      type: request.body.otpType ?? OTP_Types.Email_Verification,
    };

    return this.authService.requestOtp(data);
  }
}
