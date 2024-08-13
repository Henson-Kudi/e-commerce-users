import { GroupEntity, UserEntity } from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import kafkaTopics from '../../../utils/kafka-topics.json';
import UseCaseInterface from '../protocols';
import IGroupRepository from '../../repositories/groupsRepository';
import logger from '../../../utils/logger';

export default class AddMembersToGroup
  implements
    UseCaseInterface<
      { members: string[]; actor: string; groupId: string },
      IReturnValue<GroupEntity & { users?: UserEntity[] }>
    >
{
  constructor(
    private readonly repository: IGroupRepository,
    private readonly providers: {
      messageBroker: IMessageBroker;
    }
  ) {}
  async execute(data: {
    members: string[];
    actor: string;
    groupId: string;
  }): Promise<IReturnValue<GroupEntity & { users?: UserEntity[] }>> {
    try {
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
          users: {
            connect: data.members.map((userId) => ({
              id: userId,
            })),
          },
        },
        include: {
          users: true,
        },
      });

      // Publish message of roles added
      try {
        await messageBroker.publish({
          messages: [
            {
              value: JSON.stringify({
                group: data.groupId,
                newRoles: data.members,
                addedBy: data.actor,
              }),
            },
          ],
          topic: kafkaTopics.usersAddedToGroup,
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
