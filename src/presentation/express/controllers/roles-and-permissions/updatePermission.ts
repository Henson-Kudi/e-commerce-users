import { PermissionService } from '../../../../application/services/permissionsService';
import { PermissionEntity } from '../../../../domain/entities';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class UpdatePermission
  implements IContoller<IReturnValue<PermissionEntity>>
{
  constructor(private readonly service: PermissionService) {}
  public handle(
    request: RequestObject
  ): Promise<IReturnValue<PermissionEntity>> {
    return this.service.updatePermission({
      filter: {
        ...(request.query ?? {}),
        id: request.params?.id,
      },
      data: {
        ...(request.body ?? {}),
        updatedBy: request.headers?.userId,
      },
    });
  }
}
