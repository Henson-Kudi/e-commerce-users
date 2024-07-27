import {
  UserEntity,
  UserGroupEntity,
  UserRoleEntity,
  UserTokenEntity,
} from '../../../domain/entities';
import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import ITokenManager from '../../providers/jwtManager';
import IUserRepository from '../../repositories/userRepository';
import UseCaseInterface from '../protocols';
export default class AuthenticateJwt
  implements
    UseCaseInterface<
      { token: string; type: TokenType },
      IReturnValue<UserEntity>
    >
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly tokenManager: ITokenManager
  ) {}

  // This function expects the value of the token without 'Bearer'
  async execute({ token, type }: { token: string; type: TokenType }): Promise<
    IReturnValue<
      UserEntity & {
        roles?: UserRoleEntity[];
        groups?: UserGroupEntity[];
        tokens?: UserTokenEntity[];
      }
    >
  > {
    try {
      if (!token || !token.length || type === TokenType.OTP) {
        return {
          error: new ErrorClass(
            Errors.UnAuthorised,
            ResponseCodes.UnAuthorised,
            null,
            Errors.UnAuthorised
          ),
          success: false,
          message: 'Invalid token',
        };
      }

      // Validate token
      const decodedToken = await this.tokenManager.verifyJwtToken<{
        userId: string;
      }>(type, token);

      if (!decodedToken) {
        return {
          error: new ErrorClass(
            Errors.UnAuthorised,
            ResponseCodes.UnAuthorised,
            null,
            Errors.UnAuthorised
          ),
          success: false,
          message: 'Invalid token',
        };
      }

      // Get user
      const user = (
        await this.repository.find({
          where: {
            id: decodedToken.userId,
            isActive: true,
            isDeleted: false,
          },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
            groups: {
              include: {
                group: true,
              },
            },
            tokens: true,
          },
          take: 1,
        })
      )[0];

      if (!user) {
        return {
          error: new ErrorClass(
            Errors.UnAuthorised,
            ResponseCodes.UnAuthorised,
            null,
            Errors.UnAuthorised
          ),
          success: false,
          message: 'Invalid token',
        };
      }

      return {
        success: true,
        data: user,
        message: 'User authenticated',
      };
    } catch (err) {
      if (err instanceof ErrorClass) {
        return {
          error: err,
          success: false,
          message: err.message,
        };
      }

      const error = err as Error;
      return {
        error: new ErrorClass(
          error.message,
          ResponseCodes.ServerError,
          null,
          Errors.ServerError
        ),
        success: false,
        message: error.message,
      };
    }
  }
}
