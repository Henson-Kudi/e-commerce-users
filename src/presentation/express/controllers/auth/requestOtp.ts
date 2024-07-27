import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import { AuthService } from '../../../../application/services/authService';
import RequestObject from '../../../../utils/types/request';

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
      device: request.headers!['user-agent'],
      ip: request.ip,
    };

    return this.authService.requestOtp(data);
  }
}
