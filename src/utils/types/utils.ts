import JWT from 'jsonwebtoken';
export type DecodedToken = JWT.JwtPayload;
export type JWTOptions = JWT.SignOptions & { expiresIn: string | number };
export type DeviceDetails = {
  deviceIp?: string;
  userAgent?: string;
  deviceType?: string;
  os?: string;
  browser?: string;
};
