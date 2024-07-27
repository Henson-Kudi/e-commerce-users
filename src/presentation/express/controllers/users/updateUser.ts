import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { UsersService } from '../../../../application/services/usersService';
import {
  UserEntity,
  UserGroupEntity,
  UserRoleEntity,
  UserTokenEntity,
} from '../../../../domain/entities';
import ErrorClass from '../../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../../domain/enums';

export default class UpdateUser
  implements
    IContoller<
      IReturnValue<
        | (UserEntity & {
            roles?: UserRoleEntity[];
            groups?: UserGroupEntity[];
            tokens?: UserTokenEntity[];
          })
        | null
      >
    >
{
  constructor(private readonly userService: UsersService) {}

  handle(request: RequestObject): Promise<
    IReturnValue<
      | (UserEntity & {
          roles?: UserRoleEntity[];
          groups?: UserGroupEntity[];
          tokens?: UserTokenEntity[];
        })
      | null
    >
  > {
    if (!request.headers?.userId || !request.params.id) {
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

    return this.userService.updateUser({
      filter: {
        ...(request.query ?? {}),
        id: request.params.id,
      },
      data: request.body,
      actor: request.headers.userId,
    });
  }
}
