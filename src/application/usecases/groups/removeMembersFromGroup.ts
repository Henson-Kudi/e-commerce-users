import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import IGroupRepository from '../../repositories/groupsRepository';
import setupGroupsQuery from '../utils/setupGroupsQuery';
import { GroupQuery } from '../../../domain/dtos/groups/findGroups';
import { GroupEntity } from '../../../domain/entities';

export default class RemoveMembersFromGroup
  implements
    UseCaseInterface<
      {
        filter: GroupQuery & {
          id: string;
        };
        data: { users: string[]; actor?: string };
      },
      IReturnValue<GroupEntity>
    >
{
  constructor(
    private readonly repository: IGroupRepository,
    private readonly providers: { messageBroker: IMessageBroker }
  ) {}

  async execute(params: {
    filter: GroupQuery & {
      id: string;
    };
    data: { users: string[]; actor?: string };
  }): Promise<IReturnValue<GroupEntity>> {
    try {
      const { messageBroker } = this.providers;
      const { data, filter } = params;

      // We need to make sure all the users that has to be deleted, user actually has permission to delete
      const query = setupGroupsQuery({
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

      const result = await this.repository.update({
        where: {
          id: filter.id,
        },
        data: {
          users: {
            disconnect: data.users.map((id) => ({
              id,
            })),
          },
        },
      });

      // Publish to message broker
      await messageBroker.publish({
        topic: kafkaTopics.usersRemovedFromGroup,
        messages: [
          {
            value: JSON.stringify({
              group: filter.id,
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
