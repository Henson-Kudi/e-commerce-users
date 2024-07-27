import { RoleService } from '../../../../application/services/roleService';
import { RoleEntity } from '../../../../domain/entities';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class GetRole
  implements IContoller<IReturnValue<RoleEntity | null>>
{
  constructor(private readonly service: RoleService) {}
  public handle(
    request: RequestObject
  ): Promise<IReturnValue<RoleEntity | null>> {
    const query = {
      ...(request.query ?? {}),
      id: request.params.id,
    };
    return this.service.getRole(query);
  }
}
