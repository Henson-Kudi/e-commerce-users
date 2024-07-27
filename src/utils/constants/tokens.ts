import { CookieOptions } from 'express';

export const RefreshTokenOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  maxAge: 86400 * 1000, // refreshTokens last for 1 day by default
};

export const RefreshTokenName = 'refresh-token';
