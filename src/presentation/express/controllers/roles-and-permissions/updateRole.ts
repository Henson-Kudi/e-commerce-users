import { RoleService } from '../../../../application/services/roleService';
import { RoleEntity } from '../../../../domain/entities';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class UpdateRole
  implements IContoller<IReturnValue<RoleEntity>>
{
  constructor(private readonly service: RoleService) {}
  public handle(request: RequestObject): Promise<IReturnValue<RoleEntity>> {
    const data = {
      ...request.body,
      id: request.params.id,
    };

    return this.service.updateRole({
      filter: {
        ...(request.query ?? {}),
        id: request.params.id,
      },
      data: {
        ...data,
        updatedBy: request.headers?.userId,
      },
    });
  }
}
