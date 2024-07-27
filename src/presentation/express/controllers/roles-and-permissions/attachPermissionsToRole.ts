import { RoleService } from '../../../../application/services/roleService';
import { RolePermissionEntity } from '../../../../domain/entities';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class AttachPermissionsToRole
  implements IContoller<IReturnValue<RolePermissionEntity[] | null>>
{
  constructor(private readonly service: RoleService) {}
  public handle(
    request: RequestObject
  ): Promise<IReturnValue<RolePermissionEntity[] | null>> {
    return this.service.attachPermissionsToRole({
      ...request.body,
      roleId: request.params?.id ?? request.body.roleId,
      actor: request.headers?.userId,
    });
  }
}
