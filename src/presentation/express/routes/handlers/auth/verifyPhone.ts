import { NextFunction, Request, Response } from 'express';
import expressAdapter from '../../../../adapters/expressAdapter';
import auth from '../../../controllers/auth';
import { ResponseCodes } from '../../../../../domain/enums';

export default async function verifyPhone(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await expressAdapter(req, auth.verifyPhone);

    if (!result.success) {
      throw result.error;
    }

    return res.status(ResponseCodes.Success).json(result);
  } catch (err) {
    next(err);
  }
}
