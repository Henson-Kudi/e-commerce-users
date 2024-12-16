import {
  UserEntity,
  GroupEntity,
  RoleEntity,
  TokenEntity,
} from '../../../../domain/entities';
import UseCaseInterface from '../../protocols';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import {
  Errors,
  ResponseCodes,
  SocialLoginTypes,
} from '../../../../domain/enums';
import attemptGoogleLogin from './googleLogin';
import { GoogleAuthClient } from '../../../../utils/types/oauth';
import ErrorClass from '../../../../domain/valueObjects/customError';
import attemptNormalLogin from './normalLogin';
import IPasswordManager from '../../../providers/passwordManager';
import IUserRepository from '../../../repositories/userRepository';
export default class UserLogin
  implements
  UseCaseInterface<
    { [key: string]: unknown } & {
      email?: string;
      password?: string;
      type?: SocialLoginTypes;
    },
    IReturnValue<
      | (UserEntity & {
        tokens?: TokenEntity[];
        groups?: GroupEntity[];
        roles?: RoleEntity[];
      })
      | null
    >
  > {
  constructor(
    private readonly repositories: {
      userRepository: IUserRepository;
    },
    private readonly providers: {
      googleAuthClient: GoogleAuthClient;
      passwordManager: IPasswordManager;
      // Add for apple and facebook
    }
  ) { }

  async execute(
    params: { [key: string]: unknown } & {
      email?: string;
      password?: string;
      type?: SocialLoginTypes;
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
    const { googleAuthClient, passwordManager } = this.providers;
    const { userRepository } = this.repositories;

    try {
      let loginResponse: IReturnValue<
        | (UserEntity & {
          tokens?: TokenEntity[];
          groups?: GroupEntity[];
          roles?: RoleEntity[];
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
