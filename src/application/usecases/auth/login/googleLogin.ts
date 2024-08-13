import {
  Errors,
  ResponseCodes,
  SocialLoginTypes,
} from '../../../../domain/enums';
import {
  UserEntity,
  GroupEntity,
  RoleEntity,
  TokenEntity,
} from '../../../../domain/entities';
import envConf from '../../../../utils/env.conf';
import moment from 'moment';
import { GoogleAuthClient } from '../../../../utils/types/oauth';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import ErrorClass from '../../../../domain/valueObjects/customError';
import IUserRepository from '../../../repositories/userRepository';

export default async function attemptGoogleLogin(
  data: { [key: string]: unknown } & {
    type: SocialLoginTypes.Google;
    idToken: string;
    lastLoginAt?: string;
    lastLoginIp?: string;
    lastLoginDevice?: string;
    lastLoginLocation?: string;
  },
  repository: IUserRepository,
  oAuthCleint: GoogleAuthClient
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
  if (data.type !== SocialLoginTypes.Google) {
    return {
      success: false,
      data: null,
      error: new ErrorClass(
        'Invalid social login type',
        ResponseCodes.BadRequest,
        null,
        Errors.BadRequest
      ),
    };
  }

  if (!data.idToken) {
    return {
      success: false,
      data: null,
      error: new ErrorClass(
        'Invalid client id',
        ResponseCodes.BadRequest,
        null,
        Errors.BadRequest
      ),
    };
  }

  const googleClientId = envConf.google.oauthClientId;
  const googleClientSecret = envConf.google.oauthClientSecret;

  if (!googleClientId || !googleClientSecret) {
    throw new Error('Invalid Google client credentials');
  }

  //   Validate that  the user granted our application access to their account
  const ticket = await oAuthCleint.verifyIdToken({
    idToken: data.idToken as string,
    audience: googleClientId,
  });

  const payload = ticket.getPayload(); // Authenticated payload data

  //   if user's email is not verified or payload does not contain email or sub (googleId), then its not valid for our usecase
  if (!payload) {
    return {
      success: false,
      data: null,
      error: new ErrorClass(
        'Insufficient data',
        ResponseCodes.BadRequest,
        null,
        Errors.BadRequest
      ),
    };
  }

  if (!payload.email_verified) {
    return {
      success: false,
      data: null,
      error: new ErrorClass(
        'Insufficient data',
        ResponseCodes.BadRequest,
        null,
        Errors.BadRequest
      ),
    };
  }

  if (!payload.sub) {
    return {
      success: false,
      data: null,
      error: new ErrorClass(
        'Insufficient data',
        ResponseCodes.BadRequest,
        null,
        Errors.BadRequest
      ),
    };
  }

  if (!payload.email) {
    return {
      success: false,
      data: null,
      error: new ErrorClass(
        'Invalid social login type',
        ResponseCodes.BadRequest,
        null,
        Errors.BadRequest
      ),
    };
  }

  // At this level, user is valid google user.
  // We need to check if user already exist so we update data or crete a new user if user does not exist

  let user = await repository.findUnique({
    where: {
      email: payload.email?.trim()?.toLowerCase(),
    },
  });

  //   Id user does not already exist in db, create a new user
  if (!user) {
    //Create new user
    user = await repository.create({
      data: {
        email: payload.email,
        name: payload.name ?? 'No name',
        photo: payload.picture as string | undefined,
        googleId: payload.sub,
        lastLoginAt: moment().toDate(),
        lastLoginIp: data.lastLoginIp as string | undefined,
        lastLoginDevice: data.lastLoginDevice as string | undefined,
        lastLoginLocation: data.lastLoginLocation as string | undefined,
        phone: '',
      },
    });
  }

  // If user's account has been deactivated or deleted, we want to inform them to contact support to reacticate their account
  if (user?.isDeleted) {
    return {
      success: false,
      data: null,
      error: new ErrorClass(
        'Account deleted. Please contact support to retrieve your account before [date]',
        ResponseCodes.BadRequest,
        null,
        Errors.BadRequest
      ),
      message:
        'Account deleted. Please contact support to retrieve your account before [date]',
    };
  } else if (!user?.isActive) {
    return {
      success: false,
      data: null,
      error: new ErrorClass(
        'Your account has been deactivated. Please contact support to reactivate your account',
        ResponseCodes.BadRequest,
        null,
        Errors.BadRequest
      ),
      message:
        'Your account has been deactivated. Please contact support to reactivate your account',
    };
  }

  let updateData: { [key: string]: unknown } = {
    lastLoginAt: moment().toDate(),
    lastLoginIp: data.lastLoginIp,
    lastLoginDevice: data.lastLoginDevice,
    lastLoginLocation: data.lastLoginLocation,
  };

  // Update user's email to verified since its from a social account plus login activity
  const updatedUser = await repository.update({
    where: {
      id: user.id,
    },
    data: {
      ...updateData,
      emailVerified: true,
      googleId: payload.sub, //  update google id if it is an existing account
      photo: user?.photo ?? payload?.picture,
    },
    include: {
      roles: true,
      groups: true,
      tokens: true,
    },
  });

  return {
    success: true,
    data: updatedUser,
    message: 'Success',
  };
}
