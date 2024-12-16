import { TokenEntity, UserEntity } from '../../../domain/entities';
import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IUserRepository from '../../repositories/userRepository';
import UseCaseInterface from '../protocols';
import ITokenManager from '../../providers/jwtManager';

export default class ValidateOtpCode
  implements
    UseCaseInterface<
      { userId?: string; email?: string; phone?: string; code: string },
      IReturnValue<{ valid: boolean; user?: UserEntity }>
    >
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly providers: {
      tokenManager: ITokenManager;
    }
  ) {}

  async execute(params: {
    userId?: string;
    email?: string;
    phone?: string;
    code: string;
    loginDevice?: string;
    loginIp?: string;
  }): Promise<IReturnValue<{ valid: boolean; user?: UserEntity }>> {
    try {
      if (!params.email && !params.phone && !params.userId) {
        return {
          success: false,
          error: new ErrorClass(
            'Email or phone or userId is required',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
          message: 'Email or phone or userId is required',
        };
      }
      // get user
      const query = params.userId
        ? { id: params.userId }
        : params.email
          ? { email: params.email }
          : { phone: params.phone };

      const foundUser = (await this.userRepository.findUnique({
        where: query,
        include: {
          tokens: {
            where: {
              type: TokenType.OTP,
            },
          },
        },
      })) as UserEntity & { tokens?: TokenEntity[] };

      if (!foundUser) {
        return {
          success: false,
          error: new ErrorClass(
            'User not found',
            ResponseCodes.NotFound,
            null,
            Errors.NotFound
          ),
          message: 'User not found',
        };
      }

      const isValidToken = foundUser.tokens?.find(
        (item) => item.type === TokenType.OTP && item.token === params.code
      );

      if (!isValidToken) {
        return {
          success: false,
          error: new ErrorClass(
            'Invalid token',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
          message: 'Invalid token',
          data: { valid: false },
        };
      }

      delete foundUser.tokens;

      return {
        success: true,
        data: {
          valid: true,
          user: foundUser,
        },
        message: 'OTP Verified',
      };
    } catch (err) {
      const error = err as Error;

      return {
        success: false,
        error: new ErrorClass(
          error.message,
          ResponseCodes.ServerError,
          null,
          Errors.ServerError
        ),
        message: error.message,
      };
    }
  }
}
