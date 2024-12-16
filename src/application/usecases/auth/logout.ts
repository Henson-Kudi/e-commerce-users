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

  async execute(params: { token: string }): Promise<IReturnValue<boolean>> {
    try {
      //just delete the token from db that belongs to user
      const decodedToken = await this.tokenManager.verifyJwtToken<{
        userId?: string;
      }>(TokenType.REFRESH_TOKEN, params.token);

      if (decodedToken.userId) {
        await this.userTokensRepo.deleteMany({
          where: {
            userId: decodedToken.userId,
            token: params.token,
          },
        });
      } else {
        await this.userTokensRepo.deleteMany({
          where: {
            token: params.token,
          },
        });
      }

      return {
        success: true,
        data: true,
        message: 'Logged out from device successfully',
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
