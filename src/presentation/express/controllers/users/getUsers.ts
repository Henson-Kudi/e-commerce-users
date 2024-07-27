import { IReturnValueWithPagination } from '../../../../domain/valueObjects/returnValue';
import IContoller from '../IController';
import RequestObject from '../../../../utils/types/request';
import { UsersService } from '../../../../application/services/usersService';
import { QueryUserParams } from '../../../../domain/dtos/user/IFindUser';
import {
  UserEntity,
  UserGroupEntity,
  UserRoleEntity,
  UserTokenEntity,
} from '../../../../domain/entities';

export default class GetUsers
  implements
    IContoller<
      IReturnValueWithPagination<
        | (UserEntity & {
            roles?: UserRoleEntity[];
            groups?: UserGroupEntity[];
            tokens?: UserTokenEntity[];
          })[]
        | null
      >
    >
{
  constructor(private readonly userService: UsersService) {}

  handle(request: RequestObject): Promise<
    IReturnValueWithPagination<
      | (UserEntity & {
          roles?: UserRoleEntity[];
          groups?: UserGroupEntity[];
          tokens?: UserTokenEntity[];
        })[]
      | null
    >
  > {
    const data: QueryUserParams = {
      filter: request.query?.filter ?? {},
      options: {
        ...(request.query?.options ?? {}),
      },
    };

    let validSort = false;

    try {
      Object.keys(request.query?.options?.sort ?? {});
      validSort = true;
    } catch (err) {
      validSort = false;
    }

    if (request.query.options?.withRoles === 'true') {
      data.options = {
        ...data.options,
        withRoles: true,
      };
    } else {
      data.options = {
        ...data.options,
        withRoles: false,
      };
    }

    if (request.query.options?.withGroups === 'true') {
      data.options = {
        ...data.options,
        withGroups: true,
      };
    } else {
      data.options = {
        ...data.options,
        withGroups: false,
      };
    }

    if (request.query.options?.withTokens === 'true') {
      data.options = {
        ...data.options,
        withTokens: true,
      };
    } else {
      data.options = {
        ...data.options,
        withTokens: false,
      };
    }

    if (!validSort) {
      delete data.options?.sort;
    }

    return this.userService.getUsers(data);
  }
}
