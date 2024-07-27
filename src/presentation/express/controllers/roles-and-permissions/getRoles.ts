import { RoleService } from '../../../../application/services/roleService';
import { RoleEntity } from '../../../../domain/entities';
import { IReturnValueWithPagination } from '../../../../domain/valueObjects/returnValue';
import RequestObject from '../../../../utils/types/request';
import IContoller from '../IController';

export default class GetRoles
  implements IContoller<IReturnValueWithPagination<RoleEntity[] | null>>
{
  constructor(private readonly service: RoleService) {}
  public handle(
    request: RequestObject
  ): Promise<IReturnValueWithPagination<RoleEntity[] | null>> {
    return this.service.getRoles(request.query);
  }
}
