import { NextFunction, Request, Response } from 'express';
import {
  RefreshTokenName,
  RefreshTokenOptions,
} from '../../../../../utils/constants/tokens';
import { ResponseCodes, TokenType } from '../../../../../domain/enums';
import auth from '../../../controllers/auth';
import expressAdapter from '../../../../adapters/expressAdapter';

export default async function refreshJwt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // clear existing token
    res.clearCookie(RefreshTokenName);

    const result = await expressAdapter(req, auth.refreshAccessToken);

    if (!result.success) {
      throw result.error;
    }

    // Set new refresh token cookie
    const refreshedToken = result.data?.tokens?.find(
      (t) => t.type === TokenType.REFRESH_TOKEN
    );

    res.cookie(RefreshTokenName, refreshedToken?.token, RefreshTokenOptions);

    return res.status(ResponseCodes.Success).json(result);
  } catch (err) {
    next(err);
  }
}
