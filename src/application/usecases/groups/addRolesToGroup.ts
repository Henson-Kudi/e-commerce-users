import { GroupEntity, RoleEntity } from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import kafkaTopics from '../../../utils/kafka-topics.json';
import UseCaseInterface from '../protocols';
import logger from '../../../utils/logger';
import IGroupsRepository from '../../repositories/groupsRepository';

export default class AddRolesToGroup
  implements
    UseCaseInterface<
      { roles: string[]; actor: string; groupId: string },
      IReturnValue<GroupEntity & { roles?: RoleEntity[] }>
    >
{
  constructor(
    private readonly repository: IGroupsRepository,
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

      // Ensure group exist
      const foundGroup = await this.repository.findOne({
        where: { id: data.groupId },
      });

      if (!foundGroup || foundGroup.isDeleted) {
        return {
          success: false,
          error: new ErrorClass(
            'Requested group not found',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
        };
      }

      if (!foundGroup.isActive) {
        return {
          success: false,
          error: new ErrorClass(
            'Cannot update an inactive entity',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
        };
      }

      const updatedGroup = await this.repository.update({
        where: {
          id: data.groupId,
        },
        data: {
          roles: {
            connect: data.roles.map((roleId) => ({
              id: roleId,
            })),
          },
        },
        include: {
          roles: true,
        },
      });

      // Publish message of roles added
      try {
        await messageBroker.publish({
          messages: [
            {
              value: JSON.stringify({
                group: data.groupId,
                newRoles: data.roles,
                addedBy: data.actor,
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
        data: updatedGroup,
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
