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
    });
  }
}
