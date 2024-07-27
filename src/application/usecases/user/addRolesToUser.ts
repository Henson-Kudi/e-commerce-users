import { RoleEntity, UserEntity } from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IUserRoleRepository from '../../repositories/userRoleRepository';
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
    private readonly repository: IUserRoleRepository,
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
      const added = await Promise.all(
        data.roles.map((roleId) =>
          this.repository.createUpsert({
            where: {
              userId_roleId: {
                userId: data.userId.trim(),
                roleId: roleId.trim(),
              },
            },
            update: {},
            create: {
              userId: data.userId.trim(),
              roleId: roleId.trim(),
              createdById: data.actor,
            },
            include: {
              user: true,
              role: true,
            },
          })
        )
      );

      const user = added.find((item) => item.user);

      if (!user || !user.user) {
        return {
          success: false,
          message: 'No roles were added to the user',
          error: new ErrorClass(
            'No roles were added to the user',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
        };
      }

      // Publish to message queue
      try {
        await this.providers.messageBroker.publish({
          topic: kafkaTopics.rolesAddedToUser,
          messages: [
            {
              value: JSON.stringify({
                user: data.userId,
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
        data: {
          ...user.user,
          roles: added
            .map((item) => item?.role)
            ?.filter((item) => item != null),
        },
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
