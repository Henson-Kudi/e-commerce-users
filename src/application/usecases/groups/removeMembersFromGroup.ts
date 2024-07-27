import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import { GroupMembersQuery } from '../../../domain/dtos/user-groups/findUserGroups';
import IUserGroupRepository from '../../repositories/userGroupRepository';
import setupGroupUsersQuery from '../utils/setupGroupUsersQuery';

export default class RemoveMembersFromGroup
  implements
    UseCaseInterface<
      {
        filter: GroupMembersQuery & {
          groups: string;
        };
        data: { users: string[]; actor?: string };
      },
      IReturnValue<{ matchedCount: number }>
    >
{
  constructor(
    private readonly repository: IUserGroupRepository,
    private readonly providers: { messageBroker: IMessageBroker }
  ) {}

  async execute(params: {
    filter: GroupMembersQuery & {
      groups: string;
    };
    data: { users: string[]; actor?: string };
  }): Promise<IReturnValue<{ matchedCount: number }>> {
    try {
      const { messageBroker } = this.providers;
      const { data, filter } = params;

      // We need to make sure all the users that has to be deleted, user actually has permission to delete
      const query = setupGroupUsersQuery({
        ...filter,
        users: data.users,
      });

      const count = await this.repository.count({ where: query });

      if (count < data.users.length)
        return {
          success: false,
          message: 'Insufficient permissions',
          error: new ErrorClass(
            'Insufficient permissions',
            ResponseCodes.UnAuthorised,
            null,
            Errors.UnAuthorised
          ),
        };

      const result = await this.repository.deleteMany({
        where: {
          groupId: filter.groups,
          userId: { in: data.users },
        },
      });

      // Publish to message broker
      await messageBroker.publish({
        topic: kafkaTopics.usersRemovedFromGroup,
        messages: [
          {
            value: JSON.stringify({
              group: filter.groups,
              ...data,
            }),
          },
        ],
      });

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
