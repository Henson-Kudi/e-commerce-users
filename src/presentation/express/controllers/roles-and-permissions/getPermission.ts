import { PermissionService } from '../../../../application/services/permissionsService';
import { PermissionEntity } from '../../../../domain/entities';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class GetPermission
  implements IContoller<IReturnValue<PermissionEntity | null>>
{
  constructor(private readonly service: PermissionService) {}
  public handle(
    request: RequestObject
  ): Promise<IReturnValue<PermissionEntity | null>> {
    const query = {
      ...(request.query ?? {}),
      id: request.params.id,
    };
    return this.service.getPermission(query);
  }
}
