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

      //   if users added, then create relationships alongside
      if (Array.isArray(params.users) && params.users?.length) {
        createData.data.users = {
          create: params.users?.map((userId) => ({
            user: { connect: { id: userId } },
          })),
        };
      }

      //   if groups added, then create relationships alongside
      if (Array.isArray(params.groups) && params.groups?.length) {
        createData.data.groups = {
          create: params.groups?.map((id) => ({ group: { connect: { id } } })),
        };
      }

      //   if permissions added, then create relationships alongside
      if (Array.isArray(params.permissions) && params.permissions?.length) {
        createData.data.permissions = {
          create: params.permissions?.map((id) => ({
            permission: { connect: { id } },
          })),
        };
      }

      const createdRole = await this.repository.create(createData);

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
