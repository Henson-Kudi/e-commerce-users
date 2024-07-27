import { NextFunction, Request, Response } from 'express';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
import authService from '../../../application/services/authService';

export default function authenticateRequest(
  tokenType: TokenType = TokenType.ACCESS_TOKEN
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      let token = req.headers.authorization;

      if (!token || !token.startsWith('Bearer ')) {
        throw new ErrorClass(
          Errors.UnAuthorised,
          ResponseCodes.UnAuthorised,
          'Invalid token',
          Errors.UnAuthorised
        );
      }

      token = token.split(' ')[1];

      if (!token) {
        throw new ErrorClass(
          Errors.UnAuthorised,
          ResponseCodes.UnAuthorised,
          'Invalid token',
          Errors.UnAuthorised
        );
      }

      // Verify token
      const verifiedToken = await authService.authenticateJwt({
        token,
        type: tokenType,
      });

      if (
        !verifiedToken.data ||
        verifiedToken.error ||
        !verifiedToken.success
      ) {
        throw (
          verifiedToken.error ??
          new ErrorClass(
            Errors.UnAuthorised,
            ResponseCodes.UnAuthorised,
            'Invalid token',
            Errors.UnAuthorised
          )
        );
      }

      // Add user related data to request headers
      req.headers.userId = verifiedToken.data.id;
      req.headers.userRoles = verifiedToken.data.roles?.map((t) => t.roleId);

      next();
    } catch (error) {
      next(error);
    }
  };
}
