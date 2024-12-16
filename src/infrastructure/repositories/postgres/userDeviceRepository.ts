import { Prisma, UserDevice } from '@prisma/client';
import IUserDeviceRepository from '../../../application/repositories/userDeviceRepository';
import prisma from '../../database/postgres';

export default class UserDeviceRepository implements IUserDeviceRepository {
  private readonly db = prisma.userDevice;

  create(userDevice: Prisma.UserDeviceCreateArgs): Promise<UserDevice> {
    return this.db.create(userDevice);
  }
  update(userDevice: Prisma.UserDeviceUpdateArgs): Promise<UserDevice> {
    return this.db.update(userDevice);
  }
  findByUserId(userId: string): Promise<UserDevice[]> {
    return this.db.findMany({
      where: {
        userId,
      },
    });
  }
  findById(id: string): Promise<UserDevice | null> {
    return this.db.findUnique({
      where: {
        id,
      },
    });
  }
  findOne(query: Prisma.UserDeviceFindUniqueArgs): Promise<UserDevice | null> {
    return this.db.findUnique(query);
  }
  findMany(query: Prisma.UserDeviceFindManyArgs): Promise<UserDevice[]> {
    return this.db.findMany(query);
  }
  deleteMany(
    query: Prisma.UserDeviceDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return this.db.deleteMany(query);
  }
}
