import { RolePermissionQuery } from '../../../domain/dtos/role-permissions/findRolePermissions';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IRolePermissionRepository from '../../repositories/iRolePermission';
import UseCaseInterface from '../protocols';
import setupRolePermissionsQuery from '../utils/setupRolePermissionsQuery';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';

export default class RemovePermissionsFromRole
  implements
    UseCaseInterface<
      {
        filter: RolePermissionQuery & {
          roles: string;
        };
        data: { permissions: string[]; actor: string }; // list of roles to add
      },
      IReturnValue<{ matchedCount: number }>
    >
{
  constructor(
    private readonly repository: IRolePermissionRepository,
    private readonly providers: {
      messageBroker: IMessageBroker;
    }
  ) {}

  async execute(params: {
    filter: RolePermissionQuery & {
      roles: string;
    };
    data: { permissions: string[]; actor: string }; // list of roles to add
  }): Promise<IReturnValue<{ matchedCount: number }>> {
    try {
      const { messageBroker } = this.providers;
      const { data, filter } = params;

      const query = setupRolePermissionsQuery({
        ...filter,
        permissions: data.permissions,
      });
      // Ensure user has enough previledges
      const count = await this.repository.count({ where: query });

      if (count < data.permissions.length) {
        return {
          success: false,
          message: 'You do not have enough previledges to perform this action.',
          error: new ErrorClass(
            Errors.UnAuthorised,
            ResponseCodes.UnAuthorised,
            null,
            Errors.UnAuthorised
          ),
        };
      }

      const result = await this.repository.deleteMany({ where: query });

      // Publish message
      try {
        await messageBroker.publish({
          topic: kafkaTopics.permissionsRemovedFromRole,
          messages: [
            {
              value: JSON.stringify({ role: filter.roles, ...data }),
            },
          ],
        });
      } catch (err) {
        logger.error((err as Error).message, err);
      }

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
