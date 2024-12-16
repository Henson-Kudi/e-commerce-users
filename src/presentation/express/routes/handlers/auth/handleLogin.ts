import { NextFunction, Request, Response } from 'express';
import expressAdapter from '../../../../adapters/expressAdapter';
import authController from '../../../controllers/auth';
import {
  RefreshTokenName,
  RefreshTokenOptions,
} from '../../../../../utils/constants/tokens';
import { ResponseCodes } from '../../../../../domain/enums';
import { UserEntity } from '../../../../../domain/entities';
import IReturnValue from '../../../../../domain/valueObjects/returnValue';

export default async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // clear any cookies in frontend
    res.clearCookie(RefreshTokenName);

    const result = (await expressAdapter(
      req,
      authController.login
    )) as unknown as IReturnValue<
      UserEntity & {
        refreshToken?: { token?: string; expireAt: string | Date };
        accessToken?: { token?: string; expireAt: string | Date };
      }
    >;

    if (!result.success) {
      throw result.error;
    }

    if (result.data?.refreshToken) {
      const refreshToken = result.data?.refreshToken;

      res.cookie(RefreshTokenName, refreshToken?.token, RefreshTokenOptions);
    }

    return res.status(ResponseCodes.Success).json({
      ...result,
      data: {
        ...result.data,
        password: undefined,
      },
    });
  } catch (err) {
    next(err);
  }
}
