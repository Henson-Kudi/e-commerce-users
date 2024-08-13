import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { UsersService } from '../../../../application/services/usersService';
import {
  UserEntity,
  GroupEntity,
  RoleEntity,
  TokenEntity,
} from '../../../../domain/entities';
import ErrorClass from '../../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../../domain/enums';

export default class UpdateMyAccount
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
  constructor(private readonly userService: UsersService) {}

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

    return this.userService.updateMyAccount({
      ...request.body,
      id: request.headers.userId,
    });
  }
}
