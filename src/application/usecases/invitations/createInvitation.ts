import moment from 'moment';
import { InvitationEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import validateCreateInvitation from '../../../utils/joi/schemas/invitation';
import IInvitationsRepository from '../../repositories/invitationsRepository';
import UseCaseInterface from '../protocols';
import Joi from 'joi';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
import IMessageBroker from '../../providers/messageBroker';
import kafkaTopics from '../../../utils/kafka-topics.json';
import envConf from '../../../utils/env.conf';
import logger from '../../../utils/logger';
import ITokenManager from '../../providers/jwtManager';
import IUserTokensRepository from '../../repositories/userTokensRepository';
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
  > {
  constructor(
    private readonly repository: IInvitationsRepository,
    private readonly usersRepo: IUserRepository,
    private readonly messageBroker: IMessageBroker,
    private readonly tokenManager: ITokenManager
  ) { }

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
        }
      })

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
        await this.messageBroker.publish({
          topic: kafkaTopics.sendEmail,
          messages: [
            {
              value: JSON.stringify({
                to: params.invitee,
                message: `You have been invited to join ${envConf.AppName}. Click this link to accept or decline invitation: ${envConf.frontEndUrl}/invitations?token=${this.tokenManager.generateToken(TokenType.REFRESH_TOKEN, { invitorId: created.id })}`,
              }),
            },
          ],
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
