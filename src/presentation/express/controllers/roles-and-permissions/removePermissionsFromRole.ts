import { RoleService } from '../../../../application/services/roleService';
import { Errors, ResponseCodes } from '../../../../domain/enums';
import ErrorClass from '../../../../domain/valueObjects/customError';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class RemoveRolePermissions
  implements IContoller<IReturnValue<{ matchedCount: number }>>
{
  constructor(private readonly service: RoleService) {}
  public handle(
    request: RequestObject
  ): Promise<IReturnValue<{ matchedCount: number }>> {
    if (!request.headers?.userId || !request.params?.id) {
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

    return this.service.removePermissionsFromRole({
      data: {
        ...(request.body ?? {}),
        actor: request.headers.userId,
      },
      filter: {
        ...(request.query ?? {}),
        roles: request.params.id,
      },
    });
  }
}
