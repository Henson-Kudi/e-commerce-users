import { ResourceAccessLevels } from '../../domain/enums';

/* eslint-disable @typescript-eslint/no-explicit-any */
type RequestObject = {
  body?: any;
  query?: any;
  params?: any;
  ip?: string;
  method: string;
  path: string;
  headers?: Record<string, any> & {
    userId?: string;
    roles?: string[];
    groups?: string[];
    accessLevel?: ResourceAccessLevels;
  };
  cookies?: any;
  app?: any;
  baseUrl?: string;
  fresh?: boolean;
  hostname?: string;
  ips?: string[];
  originalUrl?: string;
  protocol?: string;
  route?: any;
  secure?: boolean;
  signedCookies?: any;
  stale?: boolean;
  subdomains?: string[];
  xhr?: boolean;
  res?: any;
  device?: string;
};

export default RequestObject;
