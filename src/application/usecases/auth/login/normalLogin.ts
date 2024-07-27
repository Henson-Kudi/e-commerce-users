import {
  UserEntity,
  UserGroupEntity,
  UserRoleEntity,
  UserTokenEntity,
} from '../../../../domain/entities';
import { Errors, ResponseCodes } from '../../../../domain/enums';
import ErrorClass from '../../../../domain/valueObjects/customError';
import IReturnValue from '../../../../domain/valueObjects/returnValue';
import IPasswordManager from '../../../providers/passwordManager';
import IUserRepository from '../../../repositories/userRepository';

export default async function attemptNormalLogin(
  data: { email: string; password: string },
  repository: IUserRepository,
  passwordManager: IPasswordManager
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
  const user = (
    await repository.find({
      where: {
        email: data.email,
      },
    })
  )[0];

  if (!user) {
    return {
      success: false,
      message: 'Invalid credentials',
      error: new ErrorClass(
        'Invalid credentials',
        ResponseCodes.BadRequest,
        null,
        Errors.BadRequest
      ),
    };
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

  if (user.googleId || user.appleId || !user.password) {
    return {
      success: false,
      message: 'Invalid login source',
      error: new ErrorClass(
        'Invalid login source',
        ResponseCodes.BadRequest,
        null,
        Errors.BadRequest
      ),
    };
  }

  //   Verify that password matches the suplied password
  const isValidPassword = await passwordManager.comparePasswords(
    data.password,
    user.password
  );

  if (!isValidPassword) {
    return {
      success: false,
      message: 'Invalid credentials',
      error: new ErrorClass(
        'Invalid credentials',
        ResponseCodes.BadRequest,
        null,
        Errors.BadRequest
      ),
    };
  }

  return {
    success: true,
    data: {
      ...user,
      password: null,
    },
    message: 'Login Success',
  };
}
