import moment from 'moment';
import { UserEntity } from '../../domain/entities';
import {
  OTP_Types,
  ResourceAccessType,
  ResponseCodes,
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
import VerifyOtpCode from '../usecases/auth/validateOtp';
import VerifyPermission from '../usecases/auth/verifyPermission';
import { generateAndSaveAndSendToken } from './utilities';
import UserDeviceService from './userDeviceService';
import ErrorClass from '../../domain/valueObjects/customError';
import humanInterval from 'human-interval';
import envConf from '../../utils/env.conf';
import {
  userEmailVerified,
  userPhoneVerified,
  userUpdated,
  refreshedAccessToken,
} from '../../utils/kafka-topics.json';
import logger from '../../utils/logger';

export class AuthService {
  private readonly userDeviceService = new UserDeviceService();

  private readonly usersRepository = new UsersRepository();
  private readonly userTokensRepository = new UserTokensRepository();
  private readonly googleAuthClient = googleServicesManager.oAuthClient;
  private readonly messageBoker = messageBroker;
  private readonly tokensManager = tokenManager;

  async login(
    params: { [key: string]: unknown } & {
      email?: string;
      password?: string;
      type?: SocialLoginTypes;
    }
  ) {
    const login = new UserLogin(
      {
        userRepository: this.usersRepository,
      },
      {
        googleAuthClient: this.googleAuthClient,
        passwordManager: passwordManager,
      }
    );
    const loginResponse = await login.execute(params);

    if (!loginResponse.success || loginResponse.error || !loginResponse.data) {
      return loginResponse;
    }

    const data = loginResponse.data;
    // ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////  FLOW ///////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    // If email is not verified, we want to force the user to verify their email
    if (!data?.emailVerified) {
      await generateAndSaveAndSendToken(
        tokenManager,
        this.userTokensRepository,
        messageBroker,
        {
          expireAt: moment().add(10, 'minutes').toDate(),
          type: TokenType.OTP,
          userId: data.id,
          email: data.email,
        }
      );

      return {
        success: true,
        redirect: true,
        message: 'Please check you mail for otp to verify your email',
        redirectType: OTP_Types.Email_Verification,
        data: {
          userId: data.id,
          email: data.email,
          requiresOtp: true,
          redirectType: OTP_Types.Email_Verification,
        },
      };
    }

    // If email is verified we want to check if its a new device or ip. if it is, then we want to force the user to confirm they're the one trying to login in new device. We need to send 2fa otp to  phone (if verified) else email.
    if (!params.deviceIp && !params.userAgent) {
      throw new ErrorClass('Invalid data', ResponseCodes.BadRequest);
    }

    const query = params.userAgent
      ? { userAgent: params.userAgent as string }
      : { deviceIp: params.deviceIp as string };

    const device = (
      await this.userDeviceService.findOneUserDevices({
        userId: data.id,
        ...query,
      })
    ).data;

    if (
      (!device || !device.length) &&
      (!params.type ||
        ![...Object.values(SocialLoginTypes)].includes(params.type))
    ) {
      await generateAndSaveAndSendToken(
        tokenManager,
        this.userTokensRepository,
        messageBroker,
        {
          expireAt: moment().add(10, 'minutes').toDate(),
          type: TokenType.OTP,
          userId: data.id,
          email: data.phoneVerified ? undefined : data.email,
          phone: data.phoneVerified ? data.phone : undefined,
        }
      );

      return {
        success: true,
        redirect: true,
        message: data.phoneVerified
          ? 'Please check your phone for otp'
          : 'Please check you mail for otp to verify your email',
        redirectType: OTP_Types._2FA_Verification,
        data: {
          userId: data.id,
          email: data.email,
          phone: data.phoneVerified ? data.phone : undefined,
          requiresOtp: true,
          redirectType: OTP_Types._2FA_Verification,
        },
      };
    }

    //If email is verified and its not a new device, then we generate tokens, update last login and return success to user.
    const tokens = await this.generateAccessAndRefreshTokens(
      data.id,
      device && device[0] ? device[0]?.id : undefined
    );

    // update last login
    if (device && device[0]) {
      await this.userDeviceService.createOrUpdateDevice({
        id: device[0].id,
        lastLoginAt: new Date().toString(),
        userId: data.id,
        userAgent: params.userAgent as string,
        deviceIp: params.deviceIp as string,
        deviceType: params.deviceType as string,
      });
    }

    return {
      success: true,
      data: {
        ...data,
        ...tokens,
        requiresOtp: false,
      },
    };
  }

  authenticateJwt(params: { token: string; type: TokenType }) {
    return new AuthenticateJwt(
      this.usersRepository,
      this.tokensManager
    ).execute(params);
  }

  logout(params: { token: string }): Promise<IReturnValue<boolean>> {
    return new UserLogout(
      this.userTokensRepository,
      this.tokensManager
    ).execute({
      token: params.token,
    });
  }

  refreshAccessToken(params: { token: string }) {
    return new RefreshAccessToken(this.userTokensRepository, {
      jwtManager: this.tokensManager,
      messageBroker: this.messageBoker,
    }).execute(params);
  }

  requestOtp(params: {
    userId?: string;
    email?: string;
    phone?: string;
    type: OTP_Types;
  }) {
    return new RequestOtpCode(
      this.userTokensRepository,
      this.usersRepository,
      this.messageBoker
    ).execute(params);
  }

  async generateAccessAndRefreshTokens(id: string, deviceId?: string) {
    // Generate access and refresh tokens to be sent to the frontend
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
    const accessToken = tokenManager.generateToken(
      TokenType.ACCESS_TOKEN,
      {
        id,
        userId: id,
      },
      {
        expiresIn: accessExpiry, // expiration in seconds
      }
    );

    // Generate refresh token
    const refreshToken = tokenManager.generateToken(
      TokenType.REFRESH_TOKEN,
      {
        id: id,
        userId: id,
      },
      {
        expiresIn: refreshExpiry, // expiration in seconds
      }
    );

    // delete all other tokens for this device or ip
    await this.userTokensRepository.deleteMany({
      where: {
        userId: id,
        deviceId: deviceId,
      },
    });

    // Save refresh token to database
    await this.userTokensRepository.create({
      data: {
        token: refreshToken,
        userId: id,
        type: TokenType.REFRESH_TOKEN,
        expireAt: moment().add(refreshExpiry, 'seconds').toDate(),
        deviceId: deviceId,
      },
    });

    try {
      this.messageBoker.publish({
        topic: refreshedAccessToken,
        message: JSON.stringify({
          userId: id,
          accessToken,
          refreshToken,
        }),
      });
    } catch (err) {
      logger.error((err as Error).message, err);
    }

    return {
      accessToken: {
        token: accessToken,
        expireAt: moment().add(accessExpiry, 'seconds').toDate(),
      },
      refreshToken: {
        token: refreshToken,
        expireAt: moment().add(refreshExpiry, 'seconds').toDate(),
      },
    };
  }

  verifyotp(params: {
    userId?: string;
    email?: string;
    phone?: string;
    code: string;
  }) {
    return new VerifyOtpCode(this.usersRepository, {
      tokenManager: tokenManager,
    }).execute(params);
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
    isLoggedIn?: boolean;
    deviceIp?: string;
    userAgent?: string;
    deviceType?: string;
    os?: string;
    browser?: string;
    location?: string;
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

      // Publish email verified event and user updated event
      try {
        this.messageBoker.publish({
          topic: userEmailVerified,
          message: JSON.stringify({
            userId: user.id,
            email: user.email,
          }),
        });

        this.messageBoker.publish({
          topic: userUpdated,
          message: JSON.stringify({
            userId: user.id,
            email: user.email,
          }),
        });
      } catch (err) {
        logger.error(err);
      }

      // Delete otp tokens
      await this.userTokensRepository.deleteMany({
        where: { userId: user.id, token: params.token, type: TokenType.OTP },
      });

      // if user is already logged in, no need to generate tokens
      if (params.isLoggedIn) {
        return {
          success: true,
          data: user,
          message: 'Email verified successfully',
        };
      }

      // if user not loggedin, generate tokens so that they can be loggedin automatically
      const device = await this.userDeviceService.createOrUpdateDevice({
        userId: user.id,
        deviceIp: params.deviceIp as string,
        userAgent: params.userAgent as string,
        deviceType: params.deviceType as string,
        os: params.os as string,
        browser: params.browser as string,
        location: params.location as string,
        lastLoginAt: moment().toDate().toString(),
      });

      const tokens = await this.generateAccessAndRefreshTokens(
        user.id,
        device.data?.id
      );

      return {
        success: true,
        data: {
          ...user,
          ...tokens,
        },
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
    isLoggedIn?: boolean;
    deviceIp?: string;
    userAgent?: string;
    deviceType?: string;
    os?: string;
    browser?: string;
    location?: string;
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

      // Publish email verified event and user updated event
      try {
        this.messageBoker.publish({
          topic: userPhoneVerified,
          message: JSON.stringify({
            userId: user.id,
            email: user.email,
          }),
        });

        this.messageBoker.publish({
          topic: userUpdated,
          message: JSON.stringify({
            userId: user.id,
            email: user.email,
          }),
        });
      } catch (err) {
        logger.error(err);
      }

      // Delete tokens
      await this.userTokensRepository.deleteMany({
        where: { userId: user.id, token: params.token, type: TokenType.OTP },
      });

      // if user is already logged in, no need to generate tokens
      if (params.isLoggedIn) {
        return {
          success: true,
          data: user,
          message: 'Phone verified successfully',
        };
      }

      // if user not loggedin, generate tokens so that they can be loggedin automatically
      const device = await this.userDeviceService.createOrUpdateDevice({
        userId: user.id,
        deviceIp: params.deviceIp as string,
        userAgent: params.userAgent as string,
        deviceType: params.deviceType as string,
        os: params.os as string,
        browser: params.browser as string,
        location: params.location as string,
        lastLoginAt: moment().toDate().toString(),
      });

      const tokens = await this.generateAccessAndRefreshTokens(
        user.id,
        device.data?.id
      );

      return {
        success: true,
        data: { ...user, ...tokens },
        message: 'Phone verified successfully',
      };
    }

    return {
      success: false,
      data: null,
      message: 'Invalid token',
    };
  }

  async authenticate2FA(params: {
    token: string;
    phone?: string;
    email?: string;
    id?: string;
    isLoggedIn?: boolean;
    deviceIp?: string;
    userAgent?: string;
    deviceType?: string;
    os?: string;
    browser?: string;
    location?: string;
  }): Promise<IReturnValue<UserEntity | null>> {
    const verifiedOtp = await this.verifyotp({
      userId: params.id,
      code: params.token,
      phone: params.phone,
      email: params.email,
    });

    // If valid, we want to delete and update user account
    if (verifiedOtp.success && verifiedOtp.data?.valid) {
      // Delete tokens
      await this.userTokensRepository.deleteMany({
        where: {
          userId: verifiedOtp.data.user?.id,
          token: params.token,
          type: TokenType.OTP,
        },
      });

      // if user is already logged in, no need to generate tokens
      if (params.isLoggedIn) {
        return {
          success: true,
          data: verifiedOtp.data.user,
          message: 'verified successfully',
        };
      }

      // if user not loggedin, generate tokens so that they can be loggedin automatically
      const device = await this.userDeviceService.createOrUpdateDevice({
        userId: verifiedOtp.data.user!.id,
        deviceIp: params.deviceIp as string,
        userAgent: params.userAgent as string,
        deviceType: params.deviceType as string,
        os: params.os as string,
        browser: params.browser as string,
        location: params.location as string,
        lastLoginAt: moment().toDate().toString(),
      });

      const tokens = await this.generateAccessAndRefreshTokens(
        verifiedOtp.data.user!.id,
        device.data?.id
      );

      return {
        success: true,
        data: { ...verifiedOtp.data.user!, ...tokens },
        message: 'verified successfully',
      };
    }

    return {
      success: false,
      data: null,
      message: verifiedOtp?.error?.message ?? 'Invalid token',
      error: verifiedOtp?.error
    };
  }
}

export default new AuthService();
