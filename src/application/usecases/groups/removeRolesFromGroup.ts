import { GroupRoleQuery } from '../../../domain/dtos/group-roles/findGroupRoles';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IGroupRoleRepository from '../../repositories/groupRolesRepository';
import UseCaseInterface from '../protocols';
import setupGroupRolesQuery from '../utils/setupGroupRolesQuery';
import kafkaTopics from '../../../utils/kafka-topics.json';

export default class RemoveRolesFromGroup
  implements
    UseCaseInterface<
      {
        filter: GroupRoleQuery & {
          groups: string;
        };
        data: { roles: string[]; actor?: string };
      },
      IReturnValue<{ matchedCount: number }>
    >
{
  constructor(
    private readonly repository: IGroupRoleRepository,
    private readonly providers: { messageBroker: IMessageBroker }
  ) {}

  async execute(params: {
    filter: GroupRoleQuery & {
      groups: string;
    };
    data: { roles: string[]; actor?: string };
  }): Promise<IReturnValue<{ matchedCount: number }>> {
    try {
      const { messageBroker } = this.providers;
      const { data, filter } = params;

      // We need to make sure all the roles that has to be deleted, user actually has permission to delete
      const query = setupGroupRolesQuery({
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

      const result = await this.repository.deleteMany({
        where: {
          groupId: filter.groups,
          roleId: { in: data.roles },
        },
      });

      // Publish to message broker
      await messageBroker.publish({
        topic: kafkaTopics.rolesRemovedFromGroup,
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
