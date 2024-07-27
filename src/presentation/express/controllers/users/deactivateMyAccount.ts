import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { UsersService } from '../../../../application/services/usersService';
import ErrorClass from '../../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../../domain/enums';

export default class DeactivateMyAccount
  implements IContoller<IReturnValue<boolean>>
{
  constructor(private readonly userService: UsersService) {}

  handle(request: RequestObject): Promise<IReturnValue<boolean>> {
    if (!request.headers?.userId) {
      return new Promise((res) => {
        return res({
          message: 'Unauthorized',
          success: false,
          error: new ErrorClass(
            Errors.UnAuthorised,
            ResponseCodes.UnAuthorised,
            null,
            Errors.UnAuthorised
          ),
        });
      });
    }

    return this.userService.deactivateAccount({
      userId: request.headers.userId,
      actor: request.headers.userId,
    });
  }
}
