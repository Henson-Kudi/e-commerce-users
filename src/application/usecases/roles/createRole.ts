import Joi from 'joi';
import ICreateRoleDTO from '../../../domain/dtos/roles/ICreateRole';
import { RoleEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import {
  CreateRoleQuery,
  DeleteRoleQuery,
  FindRolesQuery,
  UpdateRoleQuery,
} from '../../../infrastructure/repositories/protocols';
import { validateCreateRole } from '../../../utils/joi/schemas/roleSchema';
import IMessageBroker from '../../providers/messageBroker';
import IRepository from '../../repositories';
import UseCaseInterface from '../protocols';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';
import slugify from '../../../utils/slugifyString';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';

export default class CreateRole
  implements
    UseCaseInterface<
      ICreateRoleDTO & {
        users?: string[];
        permissions?: string[];
        groups?: string[];
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
    private readonly providers: {
      messageBroker: IMessageBroker;
    }
  ) {}

  async execute(params: ICreateRoleDTO): Promise<IReturnValue<RoleEntity>> {
    try {
      const { messageBroker } = this.providers;

      // Validate parametres
      await validateCreateRole(params);

      const roleSlug = slugify(params.name);

      //   Ensure that role name has not already been used
      const foundRole = (
        await this.repository.find({
          where: { slug: roleSlug },
        })
      )[0];

      if (foundRole) {
        return {
          success: false,
          message: 'Role already exists',
          error: new ErrorClass(
            Errors.BadRequest,
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
        };
      }

      // Create new role
      const createData: CreateRoleQuery = {
        data: {
          createdById: params.createdBy,
          name: params.name,
          description: params.description ?? null,
          slug: roleSlug,
        },
      };

      const createdRole = await this.repository.create({
        data: {
          ...createData.data,
          users: params.users?.length
            ? {
                connect: params.users.map((id) => ({ id })),
              }
            : undefined,
          groups: params.groups?.length
            ? {
                connect: params.groups.map((id) => ({ id })),
              }
            : undefined,
          permissions: params.permissions?.length
            ? {
                connect: params.permissions.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          permissions: !!params.permissions?.length,
          users: !!params.users?.length,
          groups: !!params.groups?.length,
        },
      });

      // Publish role created message (Using trycatch because we don't want to return an error when the role was actually created)
      try {
        await messageBroker.publish({
          messages: [{ value: JSON.stringify(createdRole) }],
          topic: kafkaTopics.roleCreated,
        });
      } catch (err) {
        const error = err as Error;
        logger.error(error?.message, err);
        // Handle logging error here (maybe to slcak, logstahs, ow ehatever)
      }

      return {
        success: true,
        data: createdRole,
        message: 'Role created successfully',
      };

      //   Create mappings if any exists
    } catch (err) {
      if (Joi.isError(err)) {
        return {
          success: false,
          message: err.message,
          error: new ErrorClass(
            Errors.ValidationError,
            ResponseCodes.ValidationError,
            err,
            Errors.ValidationError
          ),
        };
      }

      if (err instanceof ErrorClass) {
        return {
          success: false,
          message: err.message,
          error: err,
        };
      }

      const error = err as Error;
      return {
        success: false,
        message: error.message,
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
