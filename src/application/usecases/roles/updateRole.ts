import Joi from 'joi';
import { RoleEntity } from '../../../domain/entities';
import { Errors, ResponseCodes, StaticRoles } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import {
  CreateRoleQuery,
  DeleteRoleQuery,
  FindRolesQuery,
  UpdateRoleQuery,
} from '../../../infrastructure/repositories/protocols';
import slugify from '../../../utils/slugifyString';
import IRepository from '../../repositories';
import UseCaseInterface from '../protocols';
import { validateUpdateRole } from '../../../utils/joi/schemas/roleSchema';
import kafkaTopics from '../../../utils/kafka-topics.json';
import IMessageBroker from '../../providers/messageBroker';
import logger from '../../../utils/logger';
import { RoleQuery } from '../../../domain/dtos/roles/findRoles';
import setupRoleQuery from '../utils/setupRolesQuery';

export default class UpdateRole
  implements
    UseCaseInterface<
      {
        filter: Omit<RoleQuery, 'search'> & {
          id: string;
        };
        data: { name?: string; description?: string; actor: string };
      },
      IReturnValue<RoleEntity>
    >
{
  constructor(
    private readonly repository: IRepository<
      RoleEntity,
      CreateRoleQuery,
      FindRolesQuery,
      UpdateRoleQuery,
      DeleteRoleQuery
    >,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(params: {
    filter: Omit<RoleQuery, 'search'> & { id: string };
    data: { name?: string; description?: string; actor: string };
  }): Promise<IReturnValue<RoleEntity>> {
    try {
      const { data, filter } = params;
      // Validate input
      await validateUpdateRole({
        ...data,
        id: filter.id,
      });

      // Ensure user has enough permissions to update role
      // Setup query
      const query = setupRoleQuery(filter);

      const count = await this.repository.count({ where: query });

      if (count < 1) {
        return {
          success: false,
          message: 'You do not have enough permissions to update this resource',
          error: new ErrorClass(
            'You do not have enough permissions to update this resource',
            ResponseCodes.Forbidden,
            null,
            Errors.Forbidden
          ),
        };
      }

      // ensure that the new name is not already used for another role (if updating name)
      if (data.name) {
        // if Role is any of static roles, then return error
        const superAdmin = slugify(StaticRoles.SuperAdmin);
        const editor = slugify(StaticRoles.Editor);
        const viewer = slugify(StaticRoles.Viewer);
        if ([superAdmin, editor, viewer].includes(slugify(data.name))) {
          return {
            success: false,
            message: 'Cannot update this role',
            error: new ErrorClass(
              'Cannot update this role',
              ResponseCodes.BadRequest,
              null,
              Errors.BadRequest
            ),
          };
        }

        // If role already exist then return error
        const existingRole = (
          await this.repository.find({
            where: { slug: slugify(data.name) },
          })
        )[0];

        if (existingRole) {
          return {
            success: false,
            message: 'Role already exists',
            error: new ErrorClass(
              'Role already exists',
              ResponseCodes.BadRequest,
              null,
              Errors.BadRequest
            ),
          };
        }
      }

      // update existing role
      const updateData: { name?: string; description?: string; slug?: string } =
        {};

      if (data.name) {
        updateData.name = data.name;
        updateData.slug = slugify(data.name);
      }

      if (data.description) {
        updateData.description = data.description;
      }

      const updated = await this.repository.update({
        where: {
          id: filter.id,
          isActive: true,
          isDeleted: false,
        },
        data: {
          ...updateData,
          lastModifiedById: data.actor,
        },
      });

      // Publish role updated message
      try {
        await this.messageBroker.publish({
          topic: kafkaTopics.roleUpdated,
          messages: [
            {
              value: JSON.stringify({
                data: updated,
                fields: Object.keys(updateData),
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
        message: 'Role updated successfully',
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
