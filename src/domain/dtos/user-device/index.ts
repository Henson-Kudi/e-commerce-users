export type ICreateUserDeviceDTO = {
  id?: string;
  userId: string;
  deviceIp: string;
  userAgent: string;
  deviceType: string;
  browser?: string;
  location?: string;
  os?: string;
  lastLoginAt?: string | number | Date;
};

export type IFindUserDevices = {
  userId: string;
  deviceIp?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  location?: string;
  os?: string;
};
