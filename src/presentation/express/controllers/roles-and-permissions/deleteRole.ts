import { RoleService } from '../../../../application/services/roleService';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class DeleteRole implements IContoller<IReturnValue<boolean>> {
  constructor(private readonly service: RoleService) {}

  public handle(request: RequestObject): Promise<IReturnValue<boolean>> {
    return this.service.deleteRole({
      ...(request.query ?? {}),
      id: request.params.id,
      actor: request.headers!.userId!,
      hardDelete: true,
    });
  }
}
