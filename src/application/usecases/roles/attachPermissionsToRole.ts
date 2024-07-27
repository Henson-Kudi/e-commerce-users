import { RolePermissionEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IRolePermissionRepository from '../../repositories/iRolePermission';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';

export default class AttachPermissionsToRole
  implements
    UseCaseInterface<
      { permissions: string[]; actor: string; roleId: string },
      IReturnValue<RolePermissionEntity[]>
    >
{
  constructor(
    private readonly repository: IRolePermissionRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(data: {
    permissions: string[];
    actor: string;
    roleId: string;
  }): Promise<IReturnValue<RolePermissionEntity[]>> {
    // Attach permissions to role
    const rolePermissions = await Promise.all(
      data.permissions.map((permission) => {
        return this.repository.createUpsert({
          where: {
            roleId_permissionId: {
              roleId: data.roleId,
              permissionId: permission,
            },
          },
          update: {},
          create: {
            roleId: data.roleId,
            permissionId: permission,
            createdById: data.actor,
          },
          include: {
            role: true,
          },
        });
      })
    );

    // Publish to broker
    try {
      await this.messageBroker.publish({
        topic: kafkaTopics.permissionsAddedToRole,
        messages: [
          {
            value: JSON.stringify({
              role: data.roleId,
              ...data,
            }),
          },
        ],
      });
    } catch (err) {
      logger.error((err as Error).message, err);
    }

    return {
      success: true,
      data: rolePermissions,
      message: 'Permission attached to role successfully.',
    };
  }
}
