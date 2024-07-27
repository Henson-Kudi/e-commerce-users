import { GroupEntity, UserEntity } from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import kafkaTopics from '../../../utils/kafka-topics.json';
import UseCaseInterface from '../protocols';
import IUserGroupRepository from '../../repositories/userGroupRepository';
import logger from '../../../utils/logger';

export default class AddMembersToGroup
  implements
    UseCaseInterface<
      { members: string[]; actor: string; groupId: string },
      IReturnValue<GroupEntity & { users?: UserEntity[] }>
    >
{
  constructor(
    private readonly repository: IUserGroupRepository,
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

      const added = await Promise.all(
        data.members.map((userId) =>
          this.repository.createUpsert({
            where: {
              userId_groupId: {
                userId,
                groupId: data.groupId,
              },
            },
            update: {},
            create: {
              userId,
              groupId: data.groupId,
              createdById: data.actor,
            },
            include: {
              user: true,
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
          topic: kafkaTopics.usersAddedToGroup,
        });
      } catch (err) {
        logger.error((err as Error).message, err);
      }

      return {
        success: true,
        data: {
          ...added[0].group!,
          users:
            added?.map((item) => item.user).filter((item) => item != null) ??
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
