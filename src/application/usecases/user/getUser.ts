import { UserQuery } from '../../../domain/dtos/user/IFindUser';
import {
  UserEntity,
  GroupEntity,
  RoleEntity,
  TokenEntity,
} from '../../../domain/entities';
import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IUserRepository from '../../repositories/userRepository';
import UseCaseInterface from '../protocols';
import setupUserQuery from '../utils/setupUserQuery';

export default class GetUser
  implements
    UseCaseInterface<
      Omit<UserQuery, 'search'> & {
        id: string;
        withRoles?: boolean | 'true' | 'false';
        withGroups?: boolean | 'true' | 'false';
        withTokens?: boolean | 'true' | 'false';
      },
      IReturnValue<
        | (UserEntity & {
            tokens?: TokenEntity[];
            groups?: GroupEntity[];
            roles?: RoleEntity[];
          })
        | null
      >
    >
{
  constructor(private readonly repository: IUserRepository) {}

  async execute(
    params: Omit<UserQuery, 'search'> & {
      id: string;
      withRoles?: boolean | 'true' | 'false';
      withGroups?: boolean | 'true' | 'false';
      withTokens?: boolean | 'true' | 'false';
    }
  ): Promise<
    IReturnValue<
      | (UserEntity & {
          tokens?: TokenEntity[];
          groups?: GroupEntity[];
          roles?: RoleEntity[];
        })
      | null
    >
  > {
    try {
      const query = setupUserQuery(params);

      const found = await this.repository.find({
        where: query,
        include: {
          groups: params.withGroups === true || params?.withGroups === 'true',
          roles: params.withRoles === true || params?.withRoles === 'true',
          tokens:
            params.withTokens === true || params?.withTokens === 'true'
              ? {
                  where: {
                    expireAt: {
                      gte: new Date(),
                    },
                    type: {
                      not: TokenType.OTP,
                    },
                  },
                }
              : false,
        },
      });

      if (!found.length) {
        return {
          success: false,
          message: 'User not found',
          error: new ErrorClass(
            'User not found',
            ResponseCodes.NotFound,
            null,
            Errors.NotFound
          ),
          data: null,
        };
      }

      return {
        success: true,
        message: 'Found user',
        data: {
          ...found[0],
          password: null,
        },
      };
    } catch (err) {
      const error = err as Error;
      const response: IReturnValue<null> = {
        success: false,
        message: error.message,
        error: new ErrorClass(
          error.message,
          ResponseCodes.ServerError,
          null,
          Errors.ServerError
        ),
        data: null,
      };

      return response;
    }
  }
}
