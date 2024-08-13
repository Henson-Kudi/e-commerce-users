import { RoleEntity, UserEntity } from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IUserRepository from '../../repositories/userRepository';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';

export default class AddRolesToUser
  implements
    UseCaseInterface<
      { roles: string[]; actor: string; userId: string },
      IReturnValue<UserEntity & { roles?: RoleEntity[] }>
    >
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly providers: {
      messageBroker: IMessageBroker;
    }
  ) {}

  async execute(data: {
    roles: string[];
    actor: string;
    userId: string;
  }): Promise<IReturnValue<UserEntity & { roles?: RoleEntity[] }>> {
    try {
      // Ensure that this user exist
      const foundUser = await this.repository.findUnique({
        where: { id: data.userId },
      });

      if (!foundUser || foundUser.isDeleted) {
        return {
          success: false,
          error: new ErrorClass(
            'Cannot find entity with such id',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
        };
      }

      if (!foundUser.isActive) {
        return {
          success: false,
          error: new ErrorClass(
            'User is inactive. Please activate user first',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
        };
      }
      const updatedUser = await this.repository.update({
        where: { id: data.userId },
        data: {
          roles: {
            connect: data.roles.map((id) => ({ id })),
          },
          lastModifiedById: data.actor,
        },
      });

      // Publish to message queue
      try {
        await this.providers.messageBroker.publish({
          topic: kafkaTopics.rolesAddedToUser,
          messages: [
            {
              value: JSON.stringify({
                user: data.userId,
                newRoles: data.roles,
                addedBy: data.actor,
              }),
            },
          ],
        });
      } catch (err) {
        logger.error((err as Error).message, err);
      }

      return {
        success: true,
        data: updatedUser,
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
