import { ICreateUserDeviceDTO } from '../../../domain/dtos/user-device';
import { UserDeviceEntity } from '../../../domain/entities';
import { ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import logger from '../../../utils/logger';
import IMessageBroker from '../../providers/messageBroker';
import IUserDeviceRepository from '../../repositories/userDeviceRepository';
import UseCaseInterface from '../protocols';
import {
  userDeviceCreated,
  userDeviceUpdated,
} from '../../../utils/kafka-topics.json';

export default class CreateOrUpdateUserDevice
  implements
    UseCaseInterface<
      ICreateUserDeviceDTO,
      IReturnValue<
        UserDeviceEntity & {
          isNew: boolean;
        }
      >
    >
{
  constructor(
    private readonly repository: IUserDeviceRepository,
    private readonly providers: {
      messageBroker: IMessageBroker;
    }
  ) {}
  async execute(data: ICreateUserDeviceDTO): Promise<
    IReturnValue<
      UserDeviceEntity & {
        isNew: boolean;
      }
    >
  > {
    if ((!data.userAgent && !data.deviceIp) || !data.userId) {
      throw new ErrorClass('Invalid data', ResponseCodes.BadRequest);
    }

    const { messageBroker } = this.providers;

    const query = data?.id
      ? { id: data.id }
      : data.userAgent
        ? {
            userId_userAgent: {
              userId: data.userId,
              userAgent: data.userAgent,
            },
          }
        : { userId_deviceIp: { userId: data.userId, deviceIp: data.deviceIp } };

    let device = await this.repository.findOne({
      where: query,
    });

    let isNew = false;

    if (device) {
      device = await this.repository.update({
        where: { id: device.id },
        data: {
          ...device,
          ...data,
          lastLoginAt: data.lastLoginAt
            ? new Date(data.lastLoginAt)
            : undefined,
        },
      });
    } else {
      device = await this.repository.create({
        data: {
          ...data,
          lastLoginAt: data.lastLoginAt
            ? new Date(data.lastLoginAt)
            : undefined,
        },
      });
      isNew = true;
    }

    try {
      messageBroker.publish({
        topic: isNew ? userDeviceCreated : userDeviceUpdated,
        message: JSON.stringify(device),
      });
    } catch (err) {
      logger.error(err);
    }

    return {
      success: true,
      data: { ...device, isNew },
      message: isNew
        ? 'Device created successfully'
        : 'Device updated successfully',
    };
  }
}
