import { TokenType } from '../../domain/enums';
import { DecodedToken, JWTOptions } from '../../utils/types/utils';

export default interface ITokenManager {
  generateToken(
    type: TokenType,
    payload: DecodedToken,
    options?: JWTOptions
  ): string;
  verifyJwtToken<T>(
    type: 'ACCESS_TOKEN' | 'REFRESH_TOKEN',
    token: string
  ): Promise<DecodedToken & T>;
  decodeJwtToken(token: string): DecodedToken;
}
