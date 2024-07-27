import Joi from 'joi';
import IUpdateUserDTO from '../../../domain/dtos/user/IUpdateUser';
import { UserEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import UseCaseInterface from '../protocols';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';
import { validateUpdateUser } from '../../../utils/joi/schemas/userSchema.joi';
import IMessageBroker from '../../providers/messageBroker';
import { DefaultUserFieldsToSelect } from '../../../utils/constants/user';
import IUserRepository from '../../repositories/userRepository';
import { UserQuery } from '../../../domain/dtos/user/IFindUser';
import setupUserQuery from '../utils/setupUserQuery';
import logger from '../../../utils/logger';
import moment from 'moment';

export default class UpdateUser
  implements
    UseCaseInterface<
      {
        filter: Omit<UserQuery, 'search'> & {
          id: string;
        };
        data: IUpdateUserDTO;
        actor: string;
      },
      IReturnValue<UserEntity | null>
    >
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly providers: {
      messageBroker: IMessageBroker;
    }
  ) {}

  async execute(params: {
    filter: Omit<UserQuery, 'search'> & {
      id: string;
    };
    data: IUpdateUserDTO;
    actor: string;
  }): Promise<IReturnValue<UserEntity | null>> {
    const { messageBroker } = this.providers;
    try {
      const { filter, data, actor } = params;
      // Validate params
      await validateUpdateUser({
        ...data,
        id: filter.id,
        actor,
      });

      // Ensure user has enough permissions to update
      const query = setupUserQuery(filter);

      const count = await this.repository.count({
        where: query,
      });

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

      const addData: Record<string, unknown> = {};

      if (data.isDeleted) {
        addData.deletedAt = moment().toDate();
        addData.isDeleted = true;
        addData.deletedById = actor;
        addData.isActive = false;
      }

      // Update user details. Make sure to update only if user is active and not deleted
      const updated = await this.repository.update({
        where: {
          id: filter.id,
          isActive: true,
          isDeleted: false,
        },
        data: {
          ...data,
          ...addData,
          lastModifiedById: actor,
        },
        select: DefaultUserFieldsToSelect,
      });

      // Publish with message broker
      try {
        await messageBroker.publish({
          topic: 'user.updated',
          messages: [
            {
              value: JSON.stringify({
                data: updated,
                fields: Object.keys(params).filter((key) => key !== 'id'),
              }),
            },
          ],
        });
      } catch (err) {
        // Failed to publish user updated event
        logger.error((err as Error)?.message, err);
      }

      return {
        success: true,
        message: 'User updated successfully',
        data: updated,
      };
    } catch (err) {
      let response: IReturnValue<null>;

      if (Joi.isError(err)) {
        response = {
          success: false,
          message: err.message,
          error: new ErrorClass(
            err.message,
            ResponseCodes.ValidationError,
            err.details,
            Errors.ValidationError
          ),
          data: null,
        };
      } else {
        // If error is comming to this level, then this is an unhandled error. Safe to log this error to a log system or to a managed slack channel for the error to be tracked and solved asap
        const error = err as Error;
        response = {
          success: false,
          message: error.message,
          error: new ErrorClass(
            error.message,
            ResponseCodes.ServerError,
            null,
            Errors.ServerError
          ),
          data: null,
        };
      }

      return response;
    }
  }
}
