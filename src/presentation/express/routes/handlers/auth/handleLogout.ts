import { NextFunction, Request, Response } from 'express';
import expressAdapter from '../../../../adapters/expressAdapter';
import authController from '../../../controllers/auth';
import { RefreshTokenName } from '../../../../../utils/constants/tokens';
import { ResponseCodes } from '../../../../../domain/enums';

export default async function handleLogout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // clear any cookies in frontend
    res.clearCookie(RefreshTokenName);

    const result = await expressAdapter(req, authController.logout);

    if (!result.success) {
      throw result.error;
    }

    return res.status(ResponseCodes.Success).json(result);
  } catch (err) {
    next(err);
  }
}
