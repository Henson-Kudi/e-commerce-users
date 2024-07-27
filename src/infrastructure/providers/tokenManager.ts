import ITokenManager from '../../application/providers/jwtManager';
import { Errors, ResponseCodes, TokenType } from '../../domain/enums';
import ErrorClass from '../../domain/valueObjects/customError';
import envConf from '../../utils/env.conf';
import generateRandomNumber from '../../utils/generateRandomNumber';
import { DecodedToken, JWTOptions } from '../../utils/types/utils';
import Jwt from 'jsonwebtoken';

class TokenManager implements ITokenManager {
  generateToken(
    type: TokenType,
    payload: DecodedToken,
    options?: JWTOptions
  ): string {
    if (type === TokenType.OTP) {
      return generateRandomNumber(6);
    }

    if (type === TokenType.ACCESS_TOKEN) {
      return Jwt.sign(payload, envConf.JWT.AccessToken.secret, {
        ...(options ?? {}),
      });
    }

    return Jwt.sign(payload, envConf.JWT.RefreshToken.secret, {
      ...options,
    });
  }

  async verifyJwtToken<T>(
    type: TokenType,
    token: string
  ): Promise<DecodedToken & T> {
    if (token === TokenType.OTP) {
      throw new Error(
        `Invalid token type: ${type}. Allowed types are: [${TokenType.ACCESS_TOKEN}, ${TokenType.REFRESH_TOKEN}]`
      );
    }

    const secret =
      type === TokenType.ACCESS_TOKEN
        ? envConf.JWT.AccessToken.secret
        : envConf.JWT.RefreshToken.secret;

    return await new Promise((resolve, reject) => {
      Jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          reject(
            new ErrorClass(
              err.message,
              ResponseCodes.UnAuthorised,
              null,
              Errors.UnAuthorised
            )
          );
        } else {
          resolve(decoded as DecodedToken & T);
        }
      });
    });
  }

  decodeJwtToken(token: string): DecodedToken {
    return Jwt.decode(token) as DecodedToken;
  }
}

export default new TokenManager();
