import {
  ICreateUserDeviceDTO,
  IFindUserDevices,
} from '../../domain/dtos/user-device';
import messageBroker from '../../infrastructure/providers/messageBroker';
import UserDeviceRepository from '../../infrastructure/repositories/postgres/userDeviceRepository';
import IMessageBroker from '../providers/messageBroker';
import IUserDeviceRepository from '../repositories/userDeviceRepository';
import CreateOrUpdateUserDevice from '../usecases/user-devices/createDevice';
import GetUserDevices from '../usecases/user-devices/findDevices';

export default class UserDeviceService {
  private readonly _userDeviceRepository: IUserDeviceRepository =
    new UserDeviceRepository();
  private readonly broker: IMessageBroker = messageBroker;

  createOrUpdateDevice(params: ICreateUserDeviceDTO) {
    return new CreateOrUpdateUserDevice(this._userDeviceRepository, {
      messageBroker: this.broker,
    }).execute(params);
  }

  findUserDevices(params: IFindUserDevices) {
    return new GetUserDevices(this._userDeviceRepository).execute(params);
  }

  findOneUserDevices(
    params: IFindUserDevices & ({ deviceIp: string } | { userAgent: string })
  ) {
    return new GetUserDevices(this._userDeviceRepository).execute(params);
  }
}
