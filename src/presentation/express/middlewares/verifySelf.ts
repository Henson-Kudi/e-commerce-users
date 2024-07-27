import { NextFunction, Request, Response } from 'express';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';

export default function verifySelf(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const userId = req.headers.userId;

  if (id !== userId) {
    next(
      new ErrorClass(
        Errors.UnAuthorised,
        ResponseCodes.UnAuthorised,
        null,
        Errors.UnAuthorised
      )
    );
  }

  next();
}
