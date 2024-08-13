import { GroupEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';
import Joi from 'joi';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';
import slugify from '../../../utils/slugifyString';
import ICreateGroupDTO from '../../../domain/dtos/groups/ICreateGroup';
import IGroupsRepository from '../../repositories/groupsRepository';
import { validateCreateGroup } from '../../../utils/joi/schemas/groupsSchema';

export default class CreateGroup
  implements UseCaseInterface<ICreateGroupDTO, IReturnValue<GroupEntity>>
{
  constructor(
    private readonly repository: IGroupsRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(data: ICreateGroupDTO): Promise<IReturnValue<GroupEntity>> {
    try {
      // Validate data
      await validateCreateGroup(data);

      // Ensure permission does not already exist
      const slug = slugify(data.name);

      const foundPerm = await this.repository.findOne({
        where: {
          slug: slug,
        },
      });

      if (foundPerm) {
        return {
          success: false,
          message: 'Group already exists',
          error: new ErrorClass(
            'Group already exists',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
        };
      }

      const created = await this.repository.create({
        data: {
          ...data,
          createdById: data.createdBy,
          createdBy: undefined,
          slug: slug,
          roles: data.roles
            ? {
                connect: data.roles.map((id) => ({ id })),
              }
            : undefined,
          users: data.users
            ? {
                connect: data.users.map((id) => ({ id })),
              }
            : undefined,
        },
      });

      // Publish permission created event
      try {
        await this.messageBroker.publish({
          topic: kafkaTopics.groupCreated,
          messages: [{ value: JSON.stringify(created) }],
        });
      } catch (err) {
        logger.error((err as Error).message, err);
      }

      return {
        success: true,
        data: created,
        message: 'Group created successfully',
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
