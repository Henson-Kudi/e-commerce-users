import { InvitationEntity } from '../../../domain/entities';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import IInvitationsRepository from '../../repositories/invitationsRepository';
import UseCaseInterface from '../protocols';
import Joi from 'joi';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, InvitationStatus, ResponseCodes } from '../../../domain/enums';
import IMessageBroker from '../../providers/messageBroker';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';
import IUserRepository from '../../repositories/userRepository';

export default class AcceptOrRejectInvitation
  implements
    UseCaseInterface<
      {
        invitationId: string;
        actor: string;
        accept?: boolean;
      },
      IReturnValue<InvitationEntity>
    >
{
  constructor(
    private readonly repository: IInvitationsRepository,
    private readonly usersRepo: IUserRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(params: {
    invitationId: string;
    actor: string;
    accept: boolean;
  }): Promise<IReturnValue<InvitationEntity>> {
    try {
      const accept = params.accept !== false;

      const invitation = await this.repository.findUnique({
        where: {
          id: params.invitationId,
        },
      });

      if (!invitation) {
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

      const foundUser = await this.usersRepo.findUnique({
        where: {
          email: invitation?.invitee,
        },
      });

      if (!foundUser || !(foundUser.id === params.actor)) {
        return {
          success: false,
          error: new ErrorClass(
            'Invitation does not belong to you',
            ResponseCodes.BadRequest,
            null,
            Errors.BadRequest
          ),
        };
      }

      // Update invitation status
      const updated = await this.repository.update({
        where: {
          id: params.invitationId,
        },
        data: {
          status: accept
            ? InvitationStatus.ACCEPTED
            : InvitationStatus.REJECTED,
        },
      });

      // Update user details (if invitation is accepted)
      if (accept) {
        await this.usersRepo.update({
          where: {
            id: foundUser.id,
          },
          data: {
            invitedById: invitation.invitorId,
            roles: invitation.roles.length
              ? {
                  connect: invitation.roles.map((roleId) => ({
                    id: roleId,
                  })),
                }
              : undefined,
            groups: invitation.groups.length
              ? {
                  connect: invitation.groups.map((groupId) => ({
                    id: groupId,
                  })),
                }
              : undefined,
          },
        });
      }

      //   Inform message broker to send email to invitee. Note that user should be able to accept invitation only after successfully registering
      try {
        await this.messageBroker.publish({
          topic: accept
            ? kafkaTopics.invitationAccepted
            : kafkaTopics.invitationRejected,
          message: JSON.stringify(updated),
        });
      } catch (err) {
        logger.error((err as Error).message, err);
      }

      return {
        success: true,
        data: updated,
        message: `Invitation ${accept ? 'accepted' : 'rejected'} successfully`,
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
