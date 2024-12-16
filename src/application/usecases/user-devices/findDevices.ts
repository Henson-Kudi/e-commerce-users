import { IFindUserDevices } from '../../../domain/dtos/user-device';
import { UserDeviceEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IUserDeviceRepository from '../../repositories/userDeviceRepository';
import UseCaseInterface from '../protocols';

export default class GetUserDevices
  implements
    UseCaseInterface<IFindUserDevices, IReturnValue<UserDeviceEntity[]>>
{
  constructor(private readonly deviceRepository: IUserDeviceRepository) {}

  async execute(
    params: IFindUserDevices
  ): Promise<IReturnValue<UserDeviceEntity[]>> {
    const data = await this.deviceRepository.findMany({ where: params });

    return {
      success: true,
      data,
      message: 'Devices fetched successfully',
    };
  }
}
