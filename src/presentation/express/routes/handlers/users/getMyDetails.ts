import { NextFunction, Request, Response } from 'express';
import expressAdapter from '../../../../adapters/expressAdapter';
import users from '../../../controllers/users';
import { ResponseCodes } from '../../../../../domain/enums';

export default async function getMyDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.params.id = req.headers.userId as string; // required to use deactivate account function else write a new controller to handle user account deactivation

    const result = await expressAdapter(req, users.getUser);

    if (!result.success) {
      throw result.error;
    }

    return res.status(ResponseCodes.Success).json(result);
  } catch (err) {
    next(err);
  }
}
