import { Request } from 'express';
import RequestObject from '../../utils/types/request';
import IContoller from '../express/controllers/IController';
export default async function expressAdapter<T = unknown>(
  httpRequest: Request,
  handler: IContoller<T>
): Promise<T> {
  // take the required information from request and pass to controller
  const request: RequestObject = {
    ...httpRequest,
    body: httpRequest.body,
    query: httpRequest.query,
    params: httpRequest.params,
    ip: httpRequest.ip,
    method: httpRequest.method,
    path: httpRequest.path,
    headers: {
      'content-type': httpRequest.get('Content-Type'),
      Referer: httpRequest.get('referer'),
      'user-agent': httpRequest.get('User-Agent'),
      ...(httpRequest.headers ?? {}),
    },
    cookies: httpRequest.cookies,
    app: httpRequest.app,
    baseUrl: httpRequest.baseUrl,
    fresh: httpRequest.fresh,
    hostname: httpRequest.hostname,
    ips: httpRequest.ips,
    originalUrl: httpRequest.originalUrl,
    protocol: httpRequest.protocol,
    route: httpRequest.route,
    secure: httpRequest.secure,
    signedCookies: httpRequest.signedCookies,
    stale: httpRequest.stale,
    subdomains: httpRequest.subdomains,
    xhr: httpRequest.xhr,
    res: httpRequest.res,
    device: httpRequest.headers['user-agent'],
  };

  if (!request.ip) {
    request.device = httpRequest.headers['user-agent'];
    request.ip =
      httpRequest.ips[0] ??
      (Array.isArray(httpRequest.headers['x-forwarded-for'])
        ? httpRequest.headers['x-forwarded-for'][0]
        : httpRequest.headers['x-forwarded-for']);
  }
  const response = await handler.handle(request);

  return response;
}
