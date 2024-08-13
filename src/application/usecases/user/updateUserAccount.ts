import Joi from 'joi';
import { IUpdateAccountDTO } from '../../../domain/dtos/user/IUpdateUser';
import { UserEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import UseCaseInterface from '../protocols';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';
import { validateUpdateUser } from '../../../utils/joi/schemas/userSchema.joi';
import IMessageBroker from '../../providers/messageBroker';
import { DefaultUserFieldsToSelect } from '../../../utils/constants/user';
import IUserRepository from '../../repositories/userRepository';
import logger from '../../../utils/logger';
import { userUpdated } from '../../../utils/kafka-topics.json';

export default class UpdateUserAccount
  implements
    UseCaseInterface<
      IUpdateAccountDTO & { id: string },
      IReturnValue<UserEntity | null>
    >
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly providers: {
      messageBroker: IMessageBroker;
    }
  ) {}

  async execute(
    data: IUpdateAccountDTO & { id: string }
  ): Promise<IReturnValue<UserEntity | null>> {
    const { messageBroker } = this.providers;
    try {
      // Validate params
      await validateUpdateUser(data);

      // Update user details. Make sure to update only if user is active and not deleted
      const updated = await this.repository.update({
        where: {
          id: data.id,
          isActive: true,
          isDeleted: false,
        },
        data: data,
        select: DefaultUserFieldsToSelect,
      });

      // Publish with message broker
      try {
        await messageBroker.publish({
          topic: userUpdated,
          messages: [
            {
              value: JSON.stringify({
                data: updated,
                fields: Object.keys(data).filter((key) => key !== 'id'),
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
