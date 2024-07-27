import { UserEntity } from '../../domain/entities';
import {
  ResourceAccessType,
  SocialLoginTypes,
  StaticRoles,
  TokenType,
} from '../../domain/enums';
import IReturnValue from '../../domain/valueObjects/returnValue';
import googleServicesManager from '../../infrastructure/providers/googleServicesManager';
import messageBroker from '../../infrastructure/providers/messageBroker';
import passwordManager from '../../infrastructure/providers/passwordManager';
import tokenManager from '../../infrastructure/providers/tokenManager';
import UsersRepository from '../../infrastructure/repositories/postgres/usersRepository';
import UserTokensRepository from '../../infrastructure/repositories/postgres/userTokensRepository';
import AuthenticateJwt from '../usecases/auth/authenticateJwt';
import UserLogin from '../usecases/auth/login';
import UserLogout from '../usecases/auth/logout';
import RefreshAccessToken from '../usecases/auth/refreshAccessToken';
import RequestOtpCode from '../usecases/auth/requestOtp';
import VerifyOtpCode from '../usecases/auth/verifyOtp';
import VerifyPermission from '../usecases/auth/verifyPermission';

export class AuthService {
  private readonly usersRepository = new UsersRepository();
  private readonly userTokensRepository = new UserTokensRepository();
  private readonly googleAuthClient = googleServicesManager.oAuthClient;
  private readonly messageBoker = messageBroker;
  private readonly tokensManager = tokenManager;

  login(
    params: { [key: string]: unknown } & {
      email?: string;
      password?: string;
      type?: SocialLoginTypes;
    }
  ) {
    return new UserLogin(
      {
        tokensRepository: this.userTokensRepository,
        userRepository: this.usersRepository,
      },
      {
        googleAuthClient: this.googleAuthClient,
        passwordManager: passwordManager,
        tokeManager: this.tokensManager,
      }
    ).execute(params);
  }

  authenticateJwt(params: { token: string; type: TokenType }) {
    return new AuthenticateJwt(
      this.usersRepository,
      this.tokensManager
    ).execute(params);
  }

  logout(params: {
    token?: string;
    ip?: string;
    device?: string;
  }): Promise<IReturnValue<boolean>> {
    if (!params.device || !params.ip || !params.token) {
      return new Promise((resolve) => {
        resolve({
          success: false,
          data: false,
          message: 'Failed',
        });
      });
    }

    return new UserLogout(
      this.userTokensRepository,
      this.tokensManager
    ).execute({
      token: params.token,
      device: params.device,
      ip: params.ip,
    });
  }

  refreshAccessToken(params: { device: string; ip: string; token: string }) {
    return new RefreshAccessToken(this.userTokensRepository, {
      jwtManager: this.tokensManager,
    }).execute(params);
  }

  requestOtp(params: {
    userId?: string;
    email?: string;
    phone?: string;
    device?: string;
    ip?: string;
  }) {
    return new RequestOtpCode(
      this.userTokensRepository,
      this.usersRepository,
      this.messageBoker
    ).execute(params);
  }

  verifyotp(params: {
    userId?: string;
    email?: string;
    phone?: string;
    code: string;
  }) {
    return new VerifyOtpCode(this.usersRepository).execute(params);
  }

  verifyPermission(params: {
    userId: string;
    accessType: ResourceAccessType;
    module: string;
    resource: string;
    allowedRoles?: StaticRoles[];
  }) {
    return new VerifyPermission(this.usersRepository).execute(params);
  }

  async verifyEmail(params: {
    token: string;
    email?: string;
    id?: string;
  }): Promise<IReturnValue<UserEntity | null>> {
    const verifiedOtp = await this.verifyotp({
      userId: params.id,
      code: params.token,
      email: params.email,
    });

    // If valid, we want to delete and update user account
    if (verifiedOtp.success && verifiedOtp.data?.valid) {
      const whereParams = params.id
        ? { id: params.id }
        : { email: params.email };

      const user = await this.usersRepository.update({
        where: whereParams,
        data: {
          emailVerified: true,
        },
      });

      // Delete tokens
      await this.userTokensRepository.deleteMany({
        where: { userId: user.id, token: params.token, type: TokenType.OTP },
      });

      return {
        success: true,
        data: user,
        message: 'Email verified successfully',
      };
    }

    return {
      success: false,
      data: null,
      message: 'Invalid token',
    };
  }

  async verifyPhone(params: {
    token: string;
    phone?: string;
    id?: string;
  }): Promise<IReturnValue<UserEntity | null>> {
    const verifiedOtp = await this.verifyotp({
      userId: params.id,
      code: params.token,
      phone: params.phone,
    });

    // If valid, we want to delete and update user account
    if (verifiedOtp.success && verifiedOtp.data?.valid) {
      const whereParams = params.id
        ? { id: params.id }
        : { phone: params.phone };

      const user = await this.usersRepository.update({
        where: whereParams,
        data: {
          phoneVerified: true,
        },
      });

      // Delete tokens
      await this.userTokensRepository.deleteMany({
        where: { userId: user.id, token: params.token, type: TokenType.OTP },
      });

      return {
        success: true,
        data: user,
        message: 'Phone verified successfully',
      };
    }

    return {
      success: false,
      data: null,
      message: 'Invalid token',
    };
  }
}

export default new AuthService();
