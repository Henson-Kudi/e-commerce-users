import moment from 'moment';
import { UserEntity } from '../../../domain/entities';
import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import ITokenManager from '../../providers/jwtManager';
import UseCaseInterface from '../protocols';
import humanInterval from 'human-interval';
import envConf from '../../../utils/env.conf';
import IUserTokensRepository from '../../repositories/userTokensRepository';
import IMessageBroker from '../../providers/messageBroker';
import logger from '../../../utils/logger';
import { refreshedAccessToken } from '../../../utils/kafka-topics.json';

export default class RefreshAccessToken
  implements
    UseCaseInterface<
      { userId: string; device: string; ip: string; token: string },
      IReturnValue<
        UserEntity & {
          refreshToken: { token: string; expireAt: Date };
          accessToken: { token: string; expireAt: Date };
        }
      >
    >
{
  constructor(
    private readonly repository: IUserTokensRepository,
    private readonly providers: {
      jwtManager: ITokenManager;
      messageBroker: IMessageBroker;
    }
  ) {}

  async execute(params: { token: string }): Promise<
    IReturnValue<
      UserEntity & {
        refreshToken: { token: string; expireAt: Date };
        accessToken: { token: string; expireAt: Date };
      }
    >
  > {
    const { jwtManager } = this.providers;

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

      // refresh the refresh token if its 10mins to its expiry
      const diff = moment(token.expireAt).diff(moment(), 'minutes');

      // Create new tokens
      const accessExpiry = Math.floor(
        humanInterval(
          `${envConf.JWT.AccessToken.expiration.value} ${envConf.JWT.AccessToken.expiration.unit}`
        )! / 1000
      );

      const accessToken = jwtManager.generateToken(
        TokenType.ACCESS_TOKEN,
        { userId: decodedToken.userId },
        { expiresIn: accessExpiry }
      );

      let refreshToken = {
        token: token.token,
        expireAt: moment(token.expireAt).toDate(),
      };

      // if token is left 30mins or less to expiry, then refresh it by updating existing token
      if (diff <= 20) {
        const refreshExpiry = Math.floor(
          humanInterval(
            `${envConf.JWT.RefreshToken.expiration.value} ${envConf.JWT.RefreshToken.expiration.unit}`
          )! / 1000
        );
        const tokenExpiryDate = moment().add(refreshExpiry, 'seconds').toDate();

        refreshToken = {
          token: jwtManager.generateToken(
            TokenType.REFRESH_TOKEN,
            { userId: decodedToken.userId },
            { expiresIn: refreshExpiry }
          ),
          expireAt: tokenExpiryDate,
        };

        await this.repository.update({
          where: { id: token.id },
          data: {
            token: refreshToken.token,
            expireAt: tokenExpiryDate,
          },
        });
      }

      try {
        this.providers.messageBroker.publish({
          topic: refreshedAccessToken,
          message: JSON.stringify({
            userId: token.user!.id,
            refreshToken: refreshToken.token,
            accessToken: accessToken,
          }),
        });
      } catch (err) {
        logger.error((err as Error).message, err);
      }

      return {
        success: true,
        data: {
          ...token.user!,
          refreshToken,
          accessToken: {
            token: accessToken,
            expireAt: moment().add(accessExpiry, 'seconds').toDate(),
          },
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
