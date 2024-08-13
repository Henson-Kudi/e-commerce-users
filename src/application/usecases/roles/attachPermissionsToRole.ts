import { PermissionEntity, RoleEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IRoleRepository from '../../repositories/roleRepository';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';

export default class AttachPermissionsToRole
  implements
    UseCaseInterface<
      { permissions: string[]; actor: string; roleId: string },
      IReturnValue<RoleEntity & { permissions?: PermissionEntity[] }>
    >
{
  constructor(
    private readonly repository: IRoleRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(data: {
    permissions: string[];
    actor: string;
    roleId: string;
  }): Promise<IReturnValue<RoleEntity & { permissions?: PermissionEntity[] }>> {
    // Ensure role exists
    const foundRole = await this.repository.findUnique({
      where: {
        id: data.roleId,
      },
    });

    if (!foundRole || foundRole.isDeleted) {
      return {
        success: false,
        error: new ErrorClass(
          'Requested entity not found',
          ResponseCodes.BadRequest,
          null,
          Errors.BadRequest
        ),
      };
    }

    if (!foundRole.isActive) {
      return {
        success: false,
        error: new ErrorClass(
          'Please activate  role first',
          ResponseCodes.BadRequest,
          null,
          Errors.BadRequest
        ),
      };
    }
    // Attach permissions to role
    const updated = await this.repository.update({
      where: {
        id: data.roleId,
        isActive: true,
        isDeleted: false,
      },
      data: {
        permissions: {
          connect: data.permissions.map((id) => ({
            id,
          })),
        },
        lastModifiedById: data.actor,
      },
    });

    // Publish to broker
    try {
      await this.messageBroker.publish({
        topic: kafkaTopics.permissionsAddedToRole,
        messages: [
          {
            value: JSON.stringify({
              role: data.roleId,
              newPermissions: data.permissions,
              addedBy: data.actor,
            }),
          },
        ],
      });
    } catch (err) {
      logger.error((err as Error).message, err);
    }

    return {
      success: true,
      data: updated,
      message: 'Permission attached to role successfully.',
    };
  }
}
