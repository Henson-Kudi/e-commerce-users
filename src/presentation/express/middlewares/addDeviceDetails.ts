import { NextFunction, Request, Response } from 'express';

export default function addDeviceDetail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const deviceIp =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || req.get('User-Agent') || '';

  // Parse User-Agent to extract details
  const deviceType =
    req.headers['device-type'] || /Mobile|iPhone|Android/i.test(userAgent)
      ? 'Mobile'
      : 'Desktop';

  const os =
    req.headers['os'] || /Windows/i.test(userAgent)
      ? 'Windows'
      : /iPhone|iPad|Mac/i.test(userAgent)
        ? 'iOS'
        : /Android/i.test(userAgent)
          ? 'Android'
          : 'Unknown';
  const browser =
    req.headers['browser'] || /Chrome/i.test(userAgent)
      ? 'Chrome'
      : /Safari/i.test(userAgent)
        ? 'Safari'
        : /Firefox/i.test(userAgent)
          ? 'Firefox'
          : 'Unknown';

  req.headers.deviceIp = deviceIp;
  req.headers.userAgent = userAgent;
  req.headers.deviceType = deviceType;
  req.headers.os = os;
  req.headers.browser = browser;

  // use geoip api to estimate the location of the user by ip
  // npm install ipinfo
  // ipinfo(ip, (err, cLoc) => {
  //   if (err) {
  //     console.error('Error fetching location:', err);
  //   } else {
  //     console.log('User location:', cLoc);
  //     req.location = {
  //       country: cLoc.country,
  //       region: cLoc.region,
  //       city: cLoc.city,
  //       postal: cLoc.postal,
  //       latitude: cLoc.loc.split(',')[0],
  //       longitude: cLoc.loc.split(',')[1]
  //     };
  //   }
  //   next();
  // }); // to be used as a middleware
  // Ensure to also check if ip is suspected vpn || bogon || behind proxy and return error if true

  next();
}
