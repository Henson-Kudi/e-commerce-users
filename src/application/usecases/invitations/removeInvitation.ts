import IReturnValue from '../../../domain/valueObjects/returnValue';
import IInvitationsRepository from '../../repositories/invitationsRepository';
import UseCaseInterface from '../protocols';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';
import IMessageBroker from '../../providers/messageBroker';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';

export default class RemoveInvitation
  implements
    UseCaseInterface<
      {
        filter?: {
          invitor?: string | string[];
        };
        id: string;
      },
      IReturnValue<boolean>
    >
{
  constructor(
    private readonly repository: IInvitationsRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(params: {
    filter?: {
      invitor?: string | string[];
    };
    id: string;
  }): Promise<IReturnValue<boolean>> {
    try {
      //  Ensure user has permission to delete invitations
      if (params.filter) {
        const count = await this.repository.count({
          where: {
            invitorId: Array.isArray(params.filter.invitor)
              ? { in: params.filter.invitor }
              : params.filter.invitor,
            id: params.id,
          },
        });

        if (!count) {
          return {
            success: false,
            message: 'Invitation not found',
            data: false,
          };
        }
      }

      const deleted = await this.repository.delete(params.id);

      //   Inform message broker to send email to invitee
      try {
        await this.messageBroker.publish({
          topic: kafkaTopics.invitationDeleted,
          messages: [
            {
              value: params.id,
            },
          ],
        });
      } catch (err) {
        logger.error((err as Error).message, err);
      }

      return {
        success: true,
        data: deleted,
        message: 'Invitation deleted successfully',
      };
    } catch (err) {
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
