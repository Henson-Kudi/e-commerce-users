import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IRoleRepository from '../../repositories/roleRepository';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';
import { RoleQuery } from '../../../domain/dtos/roles/findRoles';
import { PermissionEntity, RoleEntity } from '../../../domain/entities';
import setupRoleQuery from '../utils/setupRolesQuery';
export default class RemovePermissionsFromRole
  implements
    UseCaseInterface<
      {
        filter: RoleQuery & {
          id: string;
        };
        data: { permissions: string[]; actor: string }; // list of roles to add
      },
      IReturnValue<RoleEntity & { permissions?: PermissionEntity[] }>
    >
{
  constructor(
    private readonly repository: IRoleRepository,
    private readonly providers: {
      messageBroker: IMessageBroker;
    }
  ) {}

  async execute(params: {
    filter: RoleQuery & {
      id: string;
    };
    data: { permissions: string[]; actor: string }; // list of roles to add
  }): Promise<IReturnValue<RoleEntity & { permissions?: PermissionEntity[] }>> {
    try {
      const { messageBroker } = this.providers;
      const { data, filter } = params;

      const query = setupRoleQuery({
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

      const result = await this.repository.update({
        where: {
          id: filter.id,
        },
        data: {
          permissions: {
            disconnect: data.permissions.map((id) => ({ id })),
          },
          lastModifiedById: data.actor,
        },
      });

      // Publish message
      try {
        await messageBroker.publish({
          topic: kafkaTopics.permissionsRemovedFromRole,
          messages: [
            {
              value: JSON.stringify({
                role: result.id,
                removedPermissions: data.permissions,
              }),
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
