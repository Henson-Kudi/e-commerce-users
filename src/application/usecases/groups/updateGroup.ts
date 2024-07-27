import { GroupEntity } from '../../../domain/entities';
import { Errors, ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import slugify from '../../../utils/slugifyString';
import IMessageBroker from '../../providers/messageBroker';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';
import Joi from 'joi';
import IGroupsRepository from '../../repositories/groupsRepository';
import { validateUpdateGroup } from '../../../utils/joi/schemas/groupsSchema';
import { GroupQuery } from '../../../domain/dtos/groups/findGroups';
import setupGroupsQuery from '../utils/setupGroupsQuery';

export default class UpdateGroup
  implements
    UseCaseInterface<
      {
        filter: Omit<GroupQuery, 'search'> & { id: string };
        data: {
          updatedBy: string;
          name?: string;
          description?: string;
        };
      },
      IReturnValue<GroupEntity>
    >
{
  constructor(
    private readonly repository: IGroupsRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(params: {
    filter: Omit<GroupQuery, 'search'> & { id: string };
    data: {
      updatedBy: string;
      name?: string;
      description?: string;
    };
  }): Promise<IReturnValue<GroupEntity>> {
    try {
      const { data, filter } = params;
      // Validate input
      await validateUpdateGroup({
        ...data,
        id: filter.id,
      });

      // ensure that the new name is not already used for another role (if updating name)
      if (data.name) {
        const existingGroup = (
          await this.repository.find({
            where: { slug: slugify(data.name) },
          })
        )[0];

        if (existingGroup) {
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
      }

      // update existing Group
      const updateData: { name?: string; description?: string; slug?: string } =
        {};

      if (data.name) {
        updateData.name = data.name;
        updateData.slug = slugify(data.name);
      }

      if (data.description) {
        updateData.description = data.description;
      }

      const query = setupGroupsQuery(filter);

      // Should find one property card with id=filter.id
      const foundGroup = (await this.repository.find({ where: query }))[0];

      if (!foundGroup || foundGroup.id !== filter.id) {
        return {
          success: false,
          message:
            'You do not have enough permissions to update  this resource',
          error: new ErrorClass(
            'You do not have enough permissions to update  this resource',
            ResponseCodes.Forbidden,
            null,
            Errors.Forbidden
          ),
        };
      }

      const updated = await this.repository.update({
        where: {
          id: filter.id,
          isActive: true,
          isDeleted: false,
        },
        data: {
          ...updateData,
          lastModifiedById: data.updatedBy,
        },
      });

      // Publish role updated message
      try {
        await this.messageBroker.publish({
          topic: kafkaTopics.groupUpdated,
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
        message: 'Group updated successfully',
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
