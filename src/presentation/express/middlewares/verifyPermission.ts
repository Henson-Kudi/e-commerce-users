import { NextFunction, Request, Response } from 'express';
import authService from '../../../application/services/authService';
import { ResourceAccessType, StaticRoles } from '../../../domain/enums';

export default function verifyPermission(
  accessType: ResourceAccessType,
  resource: string,
  allowedRoles: StaticRoles[] = []
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.verifyPermission({
        userId: req.headers.userId?.toString() ?? '',
        accessType,
        module: req.baseUrl.split('/')[3] ?? '',
        resource,
        allowedRoles,
      });

      if (!result.success || !result.data) {
        next(result.error);
      }

      req.headers.userRoles = result?.data?.userRoles;
      req.headers.userGroups = result?.data?.userGroups;
      req.headers.accessLevel = result?.data?.accessLevel;

      next();
    } catch (error) {
      next(error);
    }
  };
}
