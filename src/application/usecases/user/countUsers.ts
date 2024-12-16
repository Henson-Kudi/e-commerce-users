import { UserQuery } from '../../../domain/dtos/user/IFindUser';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IUserRepository from '../../repositories/userRepository';
import UseCaseInterface from '../protocols';
import setupUserQuery from '../utils/setupUserQuery';

export default class CountUsers
  implements UseCaseInterface<UserQuery, IReturnValue<number>>
{
  constructor(private readonly repository: IUserRepository) {}

  async execute(params?: UserQuery): Promise<IReturnValue<number>> {
    const query = setupUserQuery(params);

    try {
      const total = await this.repository.count({ where: query });

      return {
        success: true,
        message: 'Users count',
        data: total,
      };
    } catch (err) {
      const error = err as Error;
      const response: IReturnValue<number> = {
        success: false,
        message: error.message,
        error: new ErrorClass(
          error.message,
          ResponseCodes.ServerError,
          null,
          Errors.ServerError
        ),
        data: 0,
      };

      return response;
    }
  }
}
