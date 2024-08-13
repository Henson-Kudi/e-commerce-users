import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IGroupRepository from '../../repositories/groupsRepository';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import { GroupQuery } from '../../../domain/dtos/groups/findGroups';
import { GroupEntity } from '../../../domain/entities';
import setupGroupsQuery from '../utils/setupGroupsQuery';

export default class RemoveRolesFromGroup
  implements
    UseCaseInterface<
      {
        filter: GroupQuery & {
          id: string;
        };
        data: { roles: string[]; actor?: string };
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
    data: { roles: string[]; actor?: string };
  }): Promise<IReturnValue<GroupEntity>> {
    try {
      const { messageBroker } = this.providers;
      const { data, filter } = params;

      // We need to make sure all the roles that has to be deleted, user actually has permission to delete
      const query = setupGroupsQuery({
        ...filter,
        roles: data.roles,
      });

      const count = await this.repository.count({ where: query });

      if (count < data.roles.length)
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
          roles: {
            disconnect: data.roles.map((id) => ({ id })),
          },
        },
      });

      // Publish to message broker
      await messageBroker.publish({
        topic: kafkaTopics.rolesRemovedFromGroup,
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
