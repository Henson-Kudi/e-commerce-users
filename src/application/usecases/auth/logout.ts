import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import ITokenManager from '../../providers/jwtManager';
import IUserTokensRepository from '../../repositories/userTokensRepository';
import UseCaseInterface from '../protocols';

export default class UserLogout
  implements
    UseCaseInterface<
      { token: string; ip: string; device: string },
      IReturnValue<boolean>
    >
{
  constructor(
    private readonly userTokensRepo: IUserTokensRepository,
    private readonly tokenManager: ITokenManager
  ) {}

  async execute(params: {
    token: string;
    ip: string;
    device: string;
  }): Promise<IReturnValue<boolean>> {
    try {
      // Decode token and delete all tokens of that user and device or ip
      const decodedToken = await this.tokenManager.verifyJwtToken<{
        userId?: string;
      }>(TokenType.REFRESH_TOKEN, params.token);

      // just delete all user tokens, no need to check if user exists or not
      if (decodedToken.userId) {
        await this.userTokensRepo.deleteMany({
          where: {
            OR: [
              { ip: params.ip },
              { ip: null },
              { device: params.device },
              { device: null },
            ],
            userId: decodedToken.userId,
          },
        });
      }

      return {
        success: true,
        data: true,
        message: 'Loggedout from device successfully',
      };
    } catch (err) {
      const error = err as Error;
      return {
        success: false,
        error: new ErrorClass(
          error?.message,
          ResponseCodes.ServerError,
          error,
          Errors.ServerError
        ),
        message: error?.message,
      };
    }
  }
}
