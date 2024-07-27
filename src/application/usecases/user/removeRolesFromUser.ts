import { UserRoleQuery } from '../../../domain/dtos/user-roles/findUserRole';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IUserRoleRepository from '../../repositories/userRoleRepository';
import UseCaseInterface from '../protocols';
import setupUserRoleQuery from '../utils/setupUserRoleQuery';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';

export default class RemoveRolesFromUser
  implements
    UseCaseInterface<
      {
        filter: UserRoleQuery & { users: string };
        data: { roles: string[]; actor: string }; // list of roles to add
      },
      IReturnValue<{ matchedCount: number }>
    >
{
  constructor(
    private readonly repository: IUserRoleRepository,
    private readonly providers: { messageBroker: IMessageBroker }
  ) {}

  async execute(params: {
    filter: UserRoleQuery & { users: string };
    data: { roles: string[]; actor: string }; // list of roles to add
  }): Promise<IReturnValue<{ matchedCount: number }>> {
    try {
      const { messageBroker } = this.providers;
      const { data, filter } = params;

      // Ensure user has permissions to perform task
      const query = setupUserRoleQuery({
        ...filter,
        roles: data.roles, // list of roles to remove
      });
      // Ensure user has enough previledges
      const count = await this.repository.count({ where: query });

      if (count < data.roles.length) {
        return {
          success: false,
          message: 'You do not have enough previledges to perform this action.',
          error: new ErrorClass(
            Errors.UnAuthorised,
            ResponseCodes.UnAuthorised,
            null,
            Errors.UnAuthorised
          ),
        };
      }

      const result = await this.repository.deleteMany({ where: query });

      // Publish message
      try {
        await messageBroker.publish({
          topic: kafkaTopics.rolesRemovedFromUser,
          messages: [
            {
              value: JSON.stringify({
                user: filter.users,
                ...data,
              }),
            },
          ],
        });
      } catch (err) {
        logger.error((err as Error).message, err);
      }

      return {
        success: true,
        data: result,
      };
    } catch (err) {
      const error = err as Error;
      return {
        success: false,
        message: error.message,
        error: new ErrorClass(
          error.message,
          ResponseCodes.ServerError,
          err,
          Errors.ServerError
        ),
      };
    }
  }
}
