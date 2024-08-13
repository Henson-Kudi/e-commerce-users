import moment from 'moment';
import { UserEntity, TokenEntity } from '../../../domain/entities';
import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import ITokenManager from '../../providers/jwtManager';
import UseCaseInterface from '../protocols';
import humanInterval from 'human-interval';
import envConf from '../../../utils/env.conf';
import IUserTokensRepository from '../../repositories/userTokensRepository';

export default class RefreshAccessToken
  implements
    UseCaseInterface<
      { userId: string; device: string; ip: string; token: string },
      IReturnValue<UserEntity & { tokens: TokenEntity[] }>
    >
{
  constructor(
    private readonly repository: IUserTokensRepository,
    private readonly providers: {
      jwtManager: ITokenManager;
    }
  ) {}

  async execute(params: {
    device: string;
    ip: string;
    token: string;
  }): Promise<IReturnValue<UserEntity & { tokens: TokenEntity[] }>> {
    const { jwtManager } = this.providers;

    if (!params.device || !params.ip || !params.token) {
      return {
        success: false,
        error: new ErrorClass(
          'Invalid params',
          ResponseCodes.BadRequest,
          null,
          Errors.BadRequest
        ),
        message: 'Invalid params',
      };
    }

    try {
      // Ensure token is valid
      const decodedToken = await jwtManager.verifyJwtToken<{ userId?: string }>(
        TokenType.REFRESH_TOKEN,
        params.token
      );

      // Token must be for specified user
      if (!decodedToken.userId) {
        return {
          success: false,
          error: new ErrorClass(
            'Invalid token',
            ResponseCodes.Forbidden,
            null,
            Errors.Forbidden
          ),
          message: 'Invalid token',
        };
      }

      const token = (
        await this.repository.find({
          where: {
            userId: decodedToken.userId,
            ip: params.ip,
            device: params.device,
            type: TokenType.REFRESH_TOKEN,
            token: params.token,
          },
          include: {
            user: { include: { groups: true, roles: true } },
          },
          take: 1,
        })
      )[0];

      // If token does not exist, then it has been  used or expired already
      if (!token) {
        return {
          success: false,
          error: new ErrorClass(
            'Invalid token',
            ResponseCodes.Forbidden,
            null,
            Errors.Forbidden
          ),
          message: 'Invalid token',
        };
      }

      // delete token
      await this.repository.deleteMany({
        where: { userId: decodedToken.userId },
      });

      // Create new tokens
      const accessExpiry = Math.floor(
        humanInterval(
          `${envConf.JWT.AccessToken.expiration.value} ${envConf.JWT.AccessToken.expiration.unit}`
        )! / 1000
      );

      const refreshExpiry = Math.floor(
        humanInterval(
          `${envConf.JWT.RefreshToken.expiration.value} ${envConf.JWT.RefreshToken.expiration.unit}`
        )! / 1000
      );

      const accessToken = jwtManager.generateToken(
        TokenType.ACCESS_TOKEN,
        { userId: decodedToken.userId },
        { expiresIn: accessExpiry }
      );

      const refreshToken = jwtManager.generateToken(
        TokenType.REFRESH_TOKEN,
        { userId: decodedToken.userId },
        { expiresIn: refreshExpiry }
      );

      const newToken = await this.repository.create({
        data: {
          token: refreshToken,
          type: TokenType.REFRESH_TOKEN,
          device: params.device,
          ip: params.ip,
          userId: decodedToken.userId,
          expireAt: moment().add(refreshExpiry, 'seconds').toDate(),
        },
      });

      return {
        success: true,
        data: {
          ...token.user!,
          tokens: [
            newToken,
            {
              token: accessToken,
              type: TokenType.ACCESS_TOKEN,
              device: params.device,
              ip: params.ip,
              expireAt: moment().add(accessExpiry, 'seconds').toDate(),
              id: '',
              userId: decodedToken.userId,
            },
          ],
        },
        message: 'Access token refreshed successfully',
      };
    } catch (err) {
      const error = err as Error;

      return {
        success: false,
        error: new ErrorClass(
          error.message,
          ResponseCodes.ServerError,
          error,
          Errors.ServerError
        ),
        message: error.message,
      };
    }
  }
}
