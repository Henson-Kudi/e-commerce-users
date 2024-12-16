import { CookieOptions } from 'express';
import envConf from '../env.conf';

export const RefreshTokenOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  // domain: 'localhost',
  // path: '/',
  secure: envConf.NODE_ENV === 'production',
  maxAge: 86400 * 1000, // refreshTokens last for 1 day by default
};

export const RefreshTokenName = 'refresh-token';
