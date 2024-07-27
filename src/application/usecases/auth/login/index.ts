import humanInterval from 'human-interval';
import {
  UserEntity,
  UserGroupEntity,
  UserRoleEntity,
  UserTokenEntity,
} from '../../../../domain/entities';
import UseCaseInterface from '../../protocols';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import {
  Errors,
  ResponseCodes,
  SocialLoginTypes,
  TokenType,
} from '../../../../domain/enums';
import attemptGoogleLogin from './googleLogin';
import { GoogleAuthClient } from '../../../../utils/types/oauth';
import ErrorClass from '../../../../domain/valueObjects/customError';
import ITokenManager from '../../../providers/jwtManager';
import moment from 'moment';
import attemptNormalLogin from './normalLogin';
import IPasswordManager from '../../../providers/passwordManager';
import envConf from '../../../../utils/env.conf';
import IUserRepository from '../../../repositories/userRepository';
import IUserTokensRepository from '../../../repositories/userTokensRepository';
export default class UserLogin
  implements
    UseCaseInterface<
      { email?: string; password?: string },
      IReturnValue<
        | (UserEntity & {
            tokens?: UserTokenEntity[];
            groups?: UserGroupEntity[];
            roles?: UserRoleEntity[];
          })
        | null
      >
    >
{
  constructor(
    private readonly repositories: {
      userRepository: IUserRepository;
      tokensRepository: IUserTokensRepository;
    },
    private readonly providers: {
      googleAuthClient: GoogleAuthClient;
      tokeManager: ITokenManager;
      passwordManager: IPasswordManager;
      // Add for apple and facebook
    }
  ) {}

  async execute(
    params: { [key: string]: unknown } & {
      email?: string;
      password?: string;
      type?: SocialLoginTypes;
    }
  ): Promise<
    IReturnValue<
      | (UserEntity & {
          tokens?: UserTokenEntity[];
          groups?: UserGroupEntity[];
          roles?: UserRoleEntity[];
        })
      | null
    >
  > {
    const { googleAuthClient, tokeManager, passwordManager } = this.providers;
    const { userRepository, tokensRepository } = this.repositories;

    try {
      let loginResponse: IReturnValue<
        | (UserEntity & {
            tokens?: UserTokenEntity[];
            groups?: UserGroupEntity[];
            roles?: UserRoleEntity[];
          })
        | null
      > | null = null;

      switch (params.type) {
        // case SocialLoginTypes.Apple:
        //   // Handle apple login here
        //   break;

        // case SocialLoginTypes.Facebook:
        // // Handle facebook login here

        case SocialLoginTypes.Google:
          // Handle google login here
          loginResponse = await attemptGoogleLogin(
            {
              ...params,
              idToken: params.idToken as string,
              type: SocialLoginTypes.Google,
            },
            userRepository,
            googleAuthClient
          );
          break;

        default:
          // Default handle normal login
          if (!params.email || !params.password) {
            return {
              success: false,
              data: null,
              error: new ErrorClass(
                'Email and password are required',
                ResponseCodes.BadRequest,
                null,
                Errors.BadRequest
              ),
            };
          }

          loginResponse = await attemptNormalLogin(
            {
              email: params.email,
              password: params.password,
            },
            userRepository,
            passwordManager
          );
          break;
      }

      // generate new access and refresh tokens for this user
      if (loginResponse.data) {
        const data = loginResponse.data;
        // If email or phone is not verified, we want to force the user to verify their email and phone numbers
        if (!data?.emailVerified && !data.phoneVerified) {
          const returnData = {
            id: data.id,
            email: data.email,
            phone: data.phone,
            code: ResponseCodes.Redirect,
            emailVerified: data.emailVerified,
            phoneVerified: data.phoneVerified,
          } as unknown as UserEntity;

          return {
            ...loginResponse,
            data: returnData,
          };
        }
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

        // Generate access token
        const accessToken = tokeManager.generateToken(
          TokenType.ACCESS_TOKEN,
          {
            id: loginResponse.data.id,
            email: loginResponse.data.email,
          },
          {
            expiresIn: accessExpiry, // expiration in seconds
          }
        );

        // Generate refresh token
        const refreshToken = tokeManager.generateToken(
          TokenType.REFRESH_TOKEN,
          {
            id: loginResponse.data.id,
            email: loginResponse.data.email,
          },
          {
            expiresIn: refreshExpiry, // expiration in seconds
          }
        );

        // delete all other tokens for this device or ip

        await tokensRepository.deleteMany({
          where: {
            userId: loginResponse.data.id,
            OR: [
              { device: params.loginDevice ?? null },
              { ip: params.loginIp ?? null },
            ],
          },
        });

        // Save refresh token to database
        const createdRefToken = await tokensRepository.create({
          data: {
            token: refreshToken,
            userId: loginResponse.data.id,
            type: TokenType.REFRESH_TOKEN,
            expireAt: moment().add(refreshExpiry, 'seconds').toDate(),
            device: (params.loginDevice as string | undefined) ?? null,
            ip: (params.loginIp as string | undefined) ?? null,
          },
        });

        loginResponse.data.tokens = [
          {
            token: accessToken,
            type: TokenType.ACCESS_TOKEN,
            device: (params.loginDevice as string | undefined) ?? null,
            ip: (params.loginIp as string | undefined) ?? null,
            expireAt: moment().add(accessExpiry, 'seconds').toDate(),
            id: '',
            userId: loginResponse.data.id,
          },
          createdRefToken,
        ];
      }

      // We also want to add device detection here. So that if user is using a new device to login, we send an email or a notification to the primary device for user notice.

      return loginResponse;
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
