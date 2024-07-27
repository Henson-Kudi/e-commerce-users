import JWT from 'jsonwebtoken';
export type DecodedToken = JWT.JwtPayload;
export type JWTOptions = JWT.SignOptions & { expiresIn: string | number };
