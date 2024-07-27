import { NextFunction, Request, Response } from 'express';
import expressAdapter from '../../../../adapters/expressAdapter';
import { ResponseCodes } from '../../../../../domain/enums';
import rolesAndPermissions from '../../../controllers/roles-and-permissions';

export default async function attachPermissionsToRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await expressAdapter(
      req,
      rolesAndPermissions.attachPermissionsToRole
    );

    if (!result.success) {
      throw result.error;
    }

    return res.status(ResponseCodes.Success).json(result);
  } catch (err) {
    next(err);
  }
}
