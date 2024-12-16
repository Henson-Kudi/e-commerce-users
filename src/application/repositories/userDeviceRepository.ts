import { Prisma, UserDevice } from '@prisma/client';

export default interface IUserDeviceRepository {
  create(userDevice: Prisma.UserDeviceCreateArgs): Promise<UserDevice>;
  update(userDevice: Prisma.UserDeviceUpdateArgs): Promise<UserDevice>;
  findByUserId(userId: string): Promise<UserDevice[]>;
  findById(id: string): Promise<UserDevice | null>;
  findOne(query: Prisma.UserDeviceFindUniqueArgs): Promise<UserDevice | null>;
  findMany(query: Prisma.UserDeviceFindManyArgs): Promise<UserDevice[]>;
  deleteMany(
    query: Prisma.UserDeviceDeleteManyArgs
  ): Promise<Prisma.BatchPayload>;
}
