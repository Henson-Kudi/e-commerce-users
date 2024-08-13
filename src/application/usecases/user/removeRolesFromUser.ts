import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IUserRepository from '../../repositories/userRepository';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';
import { UserQuery } from '../../../domain/dtos/user/IFindUser';
import { RoleEntity, UserEntity } from '../../../domain/entities';
import setupUserQuery from '../utils/setupUserQuery';

export default class RemoveRolesFromUser
  implements
    UseCaseInterface<
      {
        filter: UserQuery & { id: string };
        data: { roles: string[]; actor: string }; // list of roles to add
      },
      IReturnValue<UserEntity & { roles?: RoleEntity[] }>
    >
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly providers: { messageBroker: IMessageBroker }
  ) {}

  async execute(params: {
    filter: UserQuery & { id: string };
    data: { roles: string[]; actor: string }; // list of roles to add
  }): Promise<IReturnValue<UserEntity & { roles?: RoleEntity[] }>> {
    try {
      const { messageBroker } = this.providers;
      const { data, filter } = params;

      // Ensure user has permissions to perform task
      const query = setupUserQuery({
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

      const result = await this.repository.update({
        where: {
          id: filter.id,
        },
        data: {
          roles: {
            disconnect: data.roles.map((role) => ({ id: role })),
          },
          lastModifiedById: data.actor,
        },
      });

      // Publish message
      try {
        await messageBroker.publish({
          topic: kafkaTopics.rolesRemovedFromUser,
          messages: [
            {
              value: JSON.stringify({
                user: filter.id,
                removedRoles: data.roles,
                removedBy: data.actor,
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
