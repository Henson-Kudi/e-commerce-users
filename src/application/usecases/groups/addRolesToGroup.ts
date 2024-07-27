import { GroupEntity, RoleEntity } from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IGroupRoleRepository from '../../repositories/groupRolesRepository';
import kafkaTopics from '../../../utils/kafka-topics.json';
import UseCaseInterface from '../protocols';
import logger from '../../../utils/logger';

export default class AddRolesToGroup
  implements
    UseCaseInterface<
      { roles: string[]; actor: string; groupId: string },
      IReturnValue<GroupEntity & { roles?: RoleEntity[] }>
    >
{
  constructor(
    private readonly repository: IGroupRoleRepository,
    private readonly providers: {
      messageBroker: IMessageBroker;
    }
  ) {}
  async execute(data: {
    roles: string[];
    actor: string;
    groupId: string;
  }): Promise<IReturnValue<GroupEntity & { roles?: RoleEntity[] }>> {
    try {
      // Add data validation
      const { messageBroker } = this.providers;

      const added = await Promise.all(
        data.roles.map((roleId) =>
          this.repository.createUpsert({
            where: {
              groupId_roleId: {
                roleId,
                groupId: data.groupId,
              },
            },
            update: {},
            create: {
              roleId,
              groupId: data.groupId,
              createdById: data.actor,
            },
            include: {
              role: true,
              group: true,
            },
          })
        )
      );

      if (!added.length) {
        return {
          success: false,
          message: 'No roles added to group',
          error: new ErrorClass(
            'No roles added to group',
            ResponseCodes.ServerError,
            null,
            Errors.ServerError
          ),
        };
      }

      // Publish message of roles added
      try {
        await messageBroker.publish({
          messages: [
            {
              value: JSON.stringify({
                group: data.groupId,
                ...data,
              }),
            },
          ],
          topic: kafkaTopics.rolesAddedToGroup,
        });
      } catch (err) {
        logger.error((err as Error).message, err);
      }

      return {
        success: true,
        data: {
          ...added[0].group!,
          roles:
            added?.map((item) => item.role).filter((item) => item != null) ??
            [],
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
