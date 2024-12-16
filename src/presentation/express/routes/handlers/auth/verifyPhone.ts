import { NextFunction, Request, Response } from 'express';
import expressAdapter from '../../../../adapters/expressAdapter';
import auth from '../../../controllers/auth';
import { ResponseCodes } from '../../../../../domain/enums';
import {
  RefreshTokenName,
  RefreshTokenOptions,
} from '../../../../../utils/constants/tokens';
import { UserEntity } from '../../../../../domain/entities';
import IReturnValue from '../../../../../domain/valueObjects/returnValue';

export default async function verifyPhone(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = (await expressAdapter(
      req,
      auth.verifyPhone
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
