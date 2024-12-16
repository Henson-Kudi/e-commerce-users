import moment from 'moment';
import { InvitationEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import validateCreateInvitation from '../../../utils/joi/schemas/invitation';
import IInvitationsRepository from '../../repositories/invitationsRepository';
import UseCaseInterface from '../protocols';
import Joi from 'joi';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';
import IMessageBroker from '../../providers/messageBroker';
import { invitationCreated } from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';
import ITokenManager from '../../providers/jwtManager';
import IUserRepository from '../../repositories/userRepository';

export default class CreateInvitation
  implements
    UseCaseInterface<
      {
        invitor: string;
        invitee: string;
        roles?: string[];
        expireAt?: Date;
      },
      IReturnValue<InvitationEntity>
    >
{
  constructor(
    private readonly repository: IInvitationsRepository,
    private readonly usersRepo: IUserRepository,
    private readonly messageBroker: IMessageBroker,
    private readonly tokenManager: ITokenManager
  ) {}

  async execute(params: {
    invitor: string;
    invitee: string;
    roles?: string[];
    expireAt?: Date;
  }): Promise<IReturnValue<InvitationEntity>> {
    try {
      await validateCreateInvitation(params);

      const invitor = await this.usersRepo.findUnique({
        where: {
          id: params.invitor,
        },
      });

      if (!invitor) {
        return {
          success: false,
          message: 'Invitor not found',
          error: new ErrorClass(
            'Invitor not found',
            ResponseCodes.NotFound,
            null,
            Errors.NotFound
          ),
        };
      }

      if (invitor.email === params.invitee) {
        return {
          success: false,
          message: 'You cannot invite yourself',
          error: new ErrorClass(
            'You cannot invite yourself',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
        };
      }

      // ensure invitation does not already exist for this user
      const count = await this.repository.count({
        where: {
          invitee: params.invitee,
          invitorId: invitor.id,
        },
      });

      if (count > 0) {
        return {
          success: false,
          message: 'Invitation already exists',
          error: new ErrorClass(
            'Invitation already exists',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
        };
      }

      const expiryDate = moment().add(2, 'weeks').toDate();

      const created = await this.repository.createUpsert({
        where: {
          invitee: params.invitee,
        },
        update: {
          expireAt: expiryDate,
          invitorId: params.invitor,
          invitee: params.invitee,
          roles: params.roles,
        },
        create: {
          invitorId: params.invitor,
          invitee: params.invitee,
          roles: params.roles,
          expireAt: expiryDate,
        },
      });

      //   Inform message broker to send email to invitee. Note that user should be able to accept invitation only after successfully registering
      try {
        this.messageBroker.publish({
          topic: invitationCreated,
          message: JSON.stringify(created),
        });
      } catch (err) {
        logger.error((err as Error).message, err);
      }

      return {
        success: true,
        data: created,
        message: 'Invitation created successfully',
      };
    } catch (err) {
      if (Joi.isError(err)) {
        return {
          success: false,
          message: err.details[0].message,
          error: new ErrorClass(
            err.details[0].message,
            ResponseCodes.ValidationError,
            err,
            Errors.ValidationError
          ),
        };
      }

      const error = err as Error;

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
