import { PermissionService } from '../../../../application/services/permissionsService';
import { PermissionEntity } from '../../../../domain/entities';
import { IReturnValueWithPagination } from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class GetPermissions
  implements IContoller<IReturnValueWithPagination<PermissionEntity[] | null>>
{
  constructor(private readonly service: PermissionService) {}
  public handle(
    request: RequestObject
  ): Promise<IReturnValueWithPagination<PermissionEntity[] | null>> {
    return this.service.getPermissions(request.query);
  }
}
