import { NextFunction, Request, Response } from 'express';
import expressAdapter from '../../../../adapters/expressAdapter';
import authController from '../../../controllers/auth';
import { TokenType } from '@prisma/client';
import {
  RefreshTokenName,
  RefreshTokenOptions,
} from '../../../../../utils/constants/tokens';
import { ResponseCodes } from '../../../../../domain/enums';

export default async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // clear any cookies in frontend
    res.clearCookie(RefreshTokenName);

    const result = await expressAdapter(req, authController.login);

    if (!result.success) {
      throw result.error;
    }

    const refreshToken = result.data?.tokens?.find(
      (t) => t.type === TokenType.REFRESH_TOKEN
    );

    res.cookie(RefreshTokenName, refreshToken, RefreshTokenOptions);

    return res.status(ResponseCodes.Success).json(result);
  } catch (err) {
    next(err);
  }
}
