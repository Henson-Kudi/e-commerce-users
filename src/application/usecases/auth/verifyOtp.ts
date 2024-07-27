import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IUserRepository from '../../repositories/userRepository';
import UseCaseInterface from '../protocols';
export default class VerifyOtpCode
  implements
    UseCaseInterface<
      { userId?: string; email?: string; phone?: string; code: string },
      IReturnValue<{ valid: boolean }>
    >
{
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: {
    userId?: string;
    email?: string;
    phone?: string;
    code: string;
  }): Promise<IReturnValue<{ valid: boolean }>> {
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
      const foundUser = (
        await this.userRepository.find({
          where: {
            OR: [
              { email: params.email },
              { id: params.userId },
              { phone: params.phone },
            ],
            tokens: {
              some: {
                type: TokenType.OTP,
                token: params.code,
              },
            },
          },
          take: 1,
          include: {
            tokens: {
              where: {
                type: TokenType.OTP,
              },
            },
          },
        })
      )[0];

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

      return {
        success: true,
        data: {
          valid: true,
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
