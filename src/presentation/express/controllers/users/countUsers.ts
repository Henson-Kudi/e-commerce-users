import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { UsersService } from '../../../../application/services/usersService';
import { UserQuery } from '../../../../domain/dtos/user/IFindUser';

export default class CountUsers implements IContoller<IReturnValue<number>> {
  constructor(private readonly userService: UsersService) {}

  handle(request: RequestObject): Promise<IReturnValue<number>> {
    const query: UserQuery = {
      ...(request.query ?? {}),
      isActive: request?.query?.isActive === 'false' ? false : true,
      isDeleted:
        request?.query?.isDeleted === 'true' || !!request.query.isDeleted,
    };

    return this.userService.countUsers(query);
  }
}
