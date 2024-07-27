import { PermissionService } from '../../../../application/services/permissionsService';
import { PermissionEntity } from '../../../../domain/entities';
import { Errors, ResponseCodes } from '../../../../domain/enums';
import ErrorClass from '../../../../domain/valueObjects/customError';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class CreatePermission
  implements IContoller<IReturnValue<PermissionEntity[] | null>>
{
  constructor(private readonly service: PermissionService) {}
  public handle(
    request: RequestObject
  ): Promise<IReturnValue<PermissionEntity[] | null>> {
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
    return this.service.createPermissions({
      data: request.body ?? [],
      createdBy: request.headers.userId,
    });
  }
}
