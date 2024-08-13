import { PermissionEntity } from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import { validateUpdatePermission } from '../../../utils/joi/schemas/permissionSchema';
import IMessageBroker from '../../providers/messageBroker';
import IPermissionRepository from '../../repositories/permissionRepository';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import Joi from 'joi';
import logger from '../../../utils/logger';
import { PermissionQuery } from '../../../domain/dtos/permissions/findPermissions';
import setupPermissionsQuery from '../utils/setupPermissionsQuery';

export default class UpdatePermission
  implements
    UseCaseInterface<
      {
        filter: Omit<PermissionQuery, 'search'> & {
          id: string;
        };
        data: {
          updatedBy: string;
          permission?: string;
          isActive?: boolean;
          roles?: string[];
        };
      },
      IReturnValue<PermissionEntity>
    >
{
  constructor(
    private readonly repository: IPermissionRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(params: {
    filter: Omit<PermissionQuery, 'search'> & {
      id: string;
    };
    data: {
      updatedBy: string;
      permission?: string;
      isActive?: boolean;
      roles?: string[];
    };
  }): Promise<IReturnValue<PermissionEntity>> {
    try {
      const { data, filter } = params;
      // throw new Error('Method not implemented.');
      // Validate input
      await validateUpdatePermission({
        ...data,
        id: filter.id,
      });

      const query = setupPermissionsQuery(filter);

      const found = await this.repository.count({
        where: query,
      });

      const Forbidden = {
        success: false,
        message: 'You do not have enough permissions to update this resource',
        error: new ErrorClass(
          Errors.Forbidden,
          ResponseCodes.Forbidden,
          'You do not have enough permissions to update this resource',
          Errors.Forbidden
        ),
      };

      if (found < 1) {
        return Forbidden;
      }

      const updated = await this.repository.update({
        where: {
          id: filter.id,
          isActive: true,
          isDeleted: false,
        },
        data: {
          ...data,

          roles: data?.roles?.length
            ? {
                connect: data.roles.map((role) => ({
                  id: role,
                })),
              }
            : undefined,
          lastModifiedById: data.updatedBy,
        },
      });

      // Publish role updated message
      try {
        await this.messageBroker.publish({
          topic: kafkaTopics.permissionUpdated,
          messages: [
            {
              value: JSON.stringify({
                data: updated,
                fields: Object.keys(data).filter((item) => item !== 'id'),
              }),
            },
          ],
        });
      } catch (err) {
        logger.error((err as Error)?.message, err);
      }

      return {
        success: !!updated,
        data: updated,
        message: 'Permission updated successfully',
      };
    } catch (error) {
      if (Joi.isError(error)) {
        return {
          success: false,
          message: error.message,
          error: new ErrorClass(
            Errors.ValidationError,
            ResponseCodes.ValidationError,
            error.details,
            Errors.ValidationError
          ),
        };
      }
      if (error instanceof ErrorClass) {
        return {
          success: false,
          message: error.message,
          error,
        };
      }

      const err = error as Error;

      return {
        success: false,
        message: err.message,
        error: new ErrorClass(
          Errors.ServerError,
          ResponseCodes.ServerError,
          err,
          Errors.ServerError
        ),
      };
    }
  }
}
