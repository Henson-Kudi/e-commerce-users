import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import { AuthService } from '../../../../application/services/authService';
import RequestObject from '../../../../utils/types/request';
import { RefreshTokenName } from '../../../../utils/constants/tokens';

export default class Logout implements IContoller<IReturnValue<boolean>> {
  constructor(private readonly authService: AuthService) {}

  handle(request: RequestObject): Promise<IReturnValue<boolean>> {
    // if no token, then you were not logged in in the first place
    if (!request.cookies[RefreshTokenName]) {
      new Promise((resolve) => {
        resolve({
          success: false,
          data: false,
          message: 'Failed',
        });
      });
    }

    const data = {
      token: request.cookies[RefreshTokenName],
      device: request.device,
      ip: request.ip,
    };

    return this.authService.logout(data);
  }
}
