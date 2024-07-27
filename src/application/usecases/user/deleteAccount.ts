import { ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import {
  sendEmail,
  sendMessage,
  userUpdated,
} from '../../../utils/kafka-topics.json';
import IMessageBroker from '../../providers/messageBroker';
import UseCaseInterface from '../protocols';
import IUserRepository from '../../repositories/userRepository';
import IUserTokensRepository from '../../repositories/userTokensRepository';

export default class DeleteAccount
  implements UseCaseInterface<{ userId: string }, IReturnValue<boolean>>
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly tokensRepository: IUserTokensRepository,
    private readonly providers: { messageBroker: IMessageBroker }
  ) {}

  async execute(params: { userId: string }): Promise<IReturnValue<boolean>> {
    try {
      const { messageBroker } = this.providers;
      //    We want to update user to deactiviated and delete  any tokens of this user
      const user = await this.repository.update({
        where: {
          id: params.userId,
        },
        data: { isDeleted: true },
      });

      // delete all tokens of this user
      await this.tokensRepository.deleteMany({
        where: { userId: user.id },
      });

      // Publish message of user updated
      await messageBroker.publish({
        messages: [
          { value: JSON.stringify({ data: user, fields: ['isDeleted'] }) },
        ],
        topic: userUpdated,
      });

      const message = `Account deleted successfully. You can still recover this account before [date]. Please contact support if you did not initiate this.`;

      // Publish message to send message and email to user
      if (user.email) {
        await messageBroker.publish({
          messages: [
            { value: JSON.stringify({ to: user.email, message: message }) },
          ],
          topic: sendEmail,
        });
      }

      if (user.phone) {
        await messageBroker.publish({
          messages: [
            { value: JSON.stringify({ to: user.phone, message: message }) },
          ],
          topic: sendMessage,
        });
      }
      // We also want to set cron job to delete user's account completely (or at least his roles, groups) after given duration (if user did not recover the account)

      return {
        success: true,
        data: true,
        message: message,
      };
    } catch (err) {
      const error = err as Error;
      return {
        success: false,
        error: new ErrorClass(
          error.message,
          ResponseCodes.ServerError,
          null,
          'Internal error'
        ),
      };
    }
  }
}
