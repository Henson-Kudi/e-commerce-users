import { PermissionService } from '../../../../application/services/permissionsService';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class RemovePermissions
  implements IContoller<IReturnValue<{ matchedCount: number }>>
{
  constructor(private readonly service: PermissionService) {}
  public handle(
    request: RequestObject
  ): Promise<IReturnValue<{ matchedCount: number }>> {
    const data = {
      ...request.body,
      actor: request.headers?.userId,
      ids: request.params.id,
      hardDelete: request.params.id ?? request.body?.hardDelete ?? false,
    };

    if (request.params.id) {
      data.hardDelete = true;
    }

    return this.service.removePermissions({
      filter: request.query,
      data,
    });
  }
}
