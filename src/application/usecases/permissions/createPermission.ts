import ICreatePermissionDTO from '../../../domain/dtos/permissions/IcreatePremission';
import { PermissionEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import { validateCreatePermissions } from '../../../utils/joi/schemas/permissionSchema';
import IMessageBroker from '../../providers/messageBroker';
import IPermissionRepository from '../../repositories/iPermissionRepository';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';
import Joi from 'joi';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';

export default class CreatePermission
  implements
    UseCaseInterface<
      { data: ICreatePermissionDTO[]; createdBy: string },
      IReturnValue<PermissionEntity[]>
    >
{
  constructor(
    private readonly repository: IPermissionRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(params: {
    data: ICreatePermissionDTO[];
    createdBy: string;
  }): Promise<IReturnValue<PermissionEntity[]>> {
    try {
      const dataToCreate = params.data.map((item) => ({
        ...item,
        createdBy: params.createdBy,
      }));
      // Validate data
      await validateCreatePermissions(dataToCreate);

      // We can create permissions with roles or routes attached. Note: Given Role or Route must have been created already
      const created = await Promise.all(
        dataToCreate.map((data) =>
          this.repository.createUpsert({
            where: {
              module_permission_resource: {
                permission: data.permission.toLowerCase(),
                module: data.module.toUpperCase(),
                resource: data.resource.toUpperCase(),
              },
            },
            update: {},
            create: {
              permission: data.permission.toLowerCase(),
              module: data.module.toUpperCase(),
              resource: data.resource.toUpperCase(),
              createdById: data.createdBy,
              roles: data?.roles?.length
                ? {
                    connect: data.roles.map((role) => ({
                      id: role,
                    })),
                  }
                : undefined,
            },
          })
        )
      );

      // Publish permission created event
      try {
        await this.messageBroker.publish({
          topic: kafkaTopics.permissionCreated,
          messages: [{ value: JSON.stringify(created) }],
        });
      } catch (err) {
        logger.error((err as Error).message, err);
      }

      return {
        success: true,
        data: created,
        message: 'Permission created successfully',
      };
    } catch (err) {
      if (Joi.isError(err)) {
        return {
          success: false,
          message: err.message,
          error: new ErrorClass(
            err.message,
            ResponseCodes.ValidationError,
            err.details,
            Errors.ValidationError
          ),
        };
      }

      const error = err as Error;

      logger.error(error.message, err);

      return {
        success: false,
        message: error.message,
        error: new ErrorClass(
          error.message,
          ResponseCodes.ServerError,
          null,
          Errors.ServerError
        ),
      };
    }
  }
}
