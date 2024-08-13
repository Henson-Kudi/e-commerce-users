import Joi from 'joi';
import { IUpdateUserPasswordDTO } from '../../../domain/dtos/user/IUpdateUser';
import { UserEntity, TokenEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import UseCaseInterface from '../protocols';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
import { validateChangePassword } from '../../../utils/joi/schemas/userSchema.joi';
import IMessageBroker from '../../providers/messageBroker';
import { DefaultUserFieldsToSelect } from '../../../utils/constants/user';
import IUserRepository from '../../repositories/userRepository';
import IUserTokensRepository from '../../repositories/userTokensRepository';
import IPasswordManager from '../../providers/passwordManager';
import { userUpdated } from '../../../utils/kafka-topics.json';

export default class ChangeUserPassword
  implements
    UseCaseInterface<IUpdateUserPasswordDTO, IReturnValue<UserEntity | null>>
{
  constructor(
    private readonly repositories: {
      usersRepository: IUserRepository;
      tokensRepository: IUserTokensRepository;
    },
    private readonly providers: {
      messageBroker: IMessageBroker;
      passwordManager: IPasswordManager;
    }
  ) {}

  async execute(params: IUpdateUserPasswordDTO): Promise<
    IReturnValue<
      | (UserEntity & {
          tokens?: TokenEntity[];
        })
      | null
    >
  > {
    const { messageBroker, passwordManager } = this.providers;
    const { tokensRepository, usersRepository } = this.repositories;

    try {
      // Validate params
      await validateChangePassword(params);

      // Ensure that user is active and not deleted
      const foundUser = (await usersRepository.findUnique({
        where: {
          id: params.id,
        },
        include: {
          tokens: {
            // Only select tokens that are valid (not expired) and are otp token
            where: {
              expireAt: {
                gte: new Date(),
              },
              type: TokenType.OTP,
            },
          },
        },
      })) as UserEntity & { tokens?: TokenEntity[] };

      if (!foundUser || !foundUser.isActive || foundUser.isDeleted) {
        return {
          success: false,
          message: 'User not found',
          error: new ErrorClass(
            'User not found',
            ResponseCodes.NotFound,
            null,
            Errors.NotFound
          ),
          data: null,
        };
      }

      //   Ensure user is not using third party login already
      if (foundUser?.googleId || foundUser?.appleId || !foundUser?.password) {
        return {
          success: false,
          message: 'Wrong authentication method',
          error: new ErrorClass(
            'Wrong authentication method',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
          data: null,
        };
      }

      // Verify otp code to ensure user is still in valid session to update email
      const verifiedToken = foundUser.tokens?.find(
        (item) => item?.token === params.otpCode
      );

      // If token is not found, then user has lost his ability to change email. User must reauthenticate for a new email
      if (!verifiedToken) {
        return {
          success: false,
          message: 'Invalid token',
          error: new ErrorClass(
            'Invalid token',
            ResponseCodes.UnAuthorised,
            null,
            Errors.UnAuthorised
          ),
          data: null,
        };
      }

      // Update user details
      const encryptedPassword = await passwordManager.encryptPassword(
        params.password
      );

      const updated = await usersRepository.update({
        where: {
          id: params.id,
        },
        data: {
          password: encryptedPassword,
        },
        select: DefaultUserFieldsToSelect,
      });

      // Delete this token so it'll not be used again
      await tokensRepository.delete(verifiedToken.id);

      // Publish with message broker
      await messageBroker.publish({
        topic: userUpdated,
        messages: [
          {
            value: JSON.stringify({
              data: updated,
              fields: ['phone'],
            }),
          },
        ],
      });

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
