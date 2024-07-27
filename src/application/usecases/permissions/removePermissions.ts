import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import IPermissionRepository from '../../repositories/iPermissionRepository';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';
import { PermissionQuery } from '../../../domain/dtos/permissions/findPermissions';
import setupPermissionsQuery from '../utils/setupPermissionsQuery';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';

export default class RemovePermissions
  implements
    UseCaseInterface<
      {
        filter: Omit<PermissionQuery, 'search'>;
        data: {
          ids: string[];
          actor: string;
          hardDelete?: boolean;
        };
      },
      IReturnValue<{ matchedCount: number }>
    >
{
  constructor(
    private readonly permissionRepository: IPermissionRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(params: {
    filter: Omit<PermissionQuery, 'search'>;
    data: {
      ids: string[];
      actor: string;
      hardDelete?: boolean;
    };
  }): Promise<IReturnValue<{ matchedCount: number }>> {
    const { data, filter } = params;

    const query = setupPermissionsQuery({
      ...filter,
      id: data.ids,
    });

    const count = await this.permissionRepository.count({ where: query });

    if (count < data.ids.length) {
      return {
        success: false,
        error: new ErrorClass(
          'You are not authorised to perform this action',
          ResponseCodes.UnAuthorised,
          null,
          Errors.UnAuthorised
        ),
        message: 'You are not authorised to perform this action',
      };
    }

    const permissionsDeleted = data.hardDelete
      ? await this.permissionRepository.deleteMany({
          where: { id: { in: data.ids } },
        })
      : await this.permissionRepository.softDeleteMany(data);

    try {
      await this.messageBroker.publish({
        topic: kafkaTopics.permissionsUpdated,
        messages: [
          {
            value: JSON.stringify(
              data.hardDelete
                ? { data: data.ids }
                : {
                    data: data,
                    fields: ['isDeleted', 'isActive'],
                  }
            ),
          },
        ],
      });
    } catch (err) {
      logger.error((err as Error).message, err);
    }

    return { success: true, data: permissionsDeleted };
  }
}
