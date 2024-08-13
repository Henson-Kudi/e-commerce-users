import ICreateUserDTO from '../../../domain/dtos/user/ICreateUser';
import { UserEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IPasswordManager from '../../providers/passwordManager';
import UseCaseInterface from '../protocols';
import { validateCreateUser } from '../../../utils/joi/schemas/userSchema.joi';
import Joi from 'joi';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';
import IMessageBroker from '../../providers/messageBroker';
import IUserRepository from '../../repositories/userRepository';
import ITokenManager from '../../providers/jwtManager';
import logger from '../../../utils/logger';
import { userCreated } from '../../../utils/kafka-topics.json';

export default class CreateUserUseCase
  implements UseCaseInterface<ICreateUserDTO, IReturnValue<UserEntity | null>>
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly providers: {
      passwordManager: IPasswordManager;
      messageBroker: IMessageBroker;
      tokenManager: ITokenManager;
    }
  ) {}
  async execute(
    data: ICreateUserDTO
  ): Promise<IReturnValue<UserEntity | null>> {
    const { passwordManager, messageBroker, tokenManager } = this.providers;
    try {
      // Validate data using joi schema
      await validateCreateUser(data);

      //   hash password (if any). Password is optional because use might be loging in with social accounts. Login with social accounts require no passwords
      if (data?.password) {
        data.password = await passwordManager.encryptPassword(data.password);
      }

      // If user was invited, make sure to pass their invitedById
      if (data?.invitorToken) {
        try {
          const decoded = tokenManager.decodeJwtToken(data.invitorToken);
          decoded?.invitorId && (data.invitedById = decoded.invitorId);
        } catch (err) {
          logger.error((err as Error).message, err);
        }
      }

      // Ensure user does not exist with any of the unique parametres
      const exists = await this.repository.find({
        where: {
          OR: [{ email: data.email }, { phone: data.phone }],
        },
      });

      if (exists.length) {
        return {
          success: false,
          message: 'User already exists',
          error: new ErrorClass(
            'User already exists',
            ResponseCodes.ValidationError,
            null,
            Errors.ValidationError
          ),
          data: null,
        };
      }

      // Create user with params
      const created = await this.repository.create({
        data: {
          ...data,
          roles: data.roles?.length
            ? {
                connect: data.roles.map((role) => ({ id: role })),
              }
            : undefined,
          groups: data.groups?.length
            ? {
                connect: data.groups.map((group) => ({ id: group })),
              }
            : undefined,
        },
      });

      // Publish with message broker
      await messageBroker.publish({
        topic: userCreated,
        messages: [{ value: JSON.stringify(created) }],
      });

      // return Structured data
      return {
        success: true,
        message: 'User created successfully',
        data: created,
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
