import { TokenType, InvitationStatus } from '@prisma/client';

export enum ResponseCodes {
  BadRequest = 400,
  UnAuthorised = 401,
  Forbidden = 403,
  NotFound = 404,
  RequestTimeOutError = 408,
  ValidationError = 422,

  Redirect = 300,

  ServerError = 500,
  GatewayTimeOut = 502,
  ServerDown = 503,

  Success = 201,
}

export enum Errors {
  BadRequest = 'BadRequest',
  UnAuthorised = 'UnAuthorised',
  Forbidden = 'Forbidden',
  NotFound = 'NotFound',
  RequestTimeOutError = 'RequestTimeOutError',
  ValidationError = 'ValidationError',
  ServerError = 'ServerError',
  GatewayTimeOut = 'GatewayTimeOut',
  ServerDown = 'ServerDown',
}

export enum SocialLoginTypes {
  Google = 'Google',
  Apple = 'Apple',
  Facebook = 'Facebook',
}

export enum ResourceAccessType {
  Read = 'r',
  Write = 'w',
  Update = 'u',
  Delete = 'd',
}

export enum ResourceAccessLevels {
  All = 'All',
  Group = 'Group',
  User = 'User',
  None = 'None',
}

export type CombinedPermission = {
  userLevel: string;
  groupLevel: string;
  allLevel: string;
};

export enum StaticRoles {
  SuperAdmin = 'Super Admin',
  Editor = 'Editor',
  Viewer = 'Viewer',
}

export enum OTP_Types {
  Email_Verification = 'email_verification',
  Phone_Verification = 'phone_verification',
  _2FA_Verification = '2FA',
  Password_Reset = 'password_reset',
}

export { TokenType, InvitationStatus };
