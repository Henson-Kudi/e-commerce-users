import { ResponseCodes } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import { userDeactivated } from '../../../utils/kafka-topics.json';
import IMessageBroker from '../../providers/messageBroker';
import IUserRepository from '../../repositories/userRepository';
import IUserTokensRepository from '../../repositories/userTokensRepository';
import UseCaseInterface from '../protocols';

export default class DeactivateAccount
  implements
    UseCaseInterface<{ userId: string; actor: string }, IReturnValue<boolean>>
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly tokensRepository: IUserTokensRepository,
    private readonly providers: { messageBroker: IMessageBroker }
  ) {}

  async execute(params: {
    userId: string;
    actor: string;
  }): Promise<IReturnValue<boolean>> {
    const { messageBroker } = this.providers;
    try {
      //    We want to update user to deactiviated and delete  any tokens of this user
      const user = await this.repository.update({
        where: {
          id: params.userId,
          isActive: true,
          isDeleted: false,
        },
        data: { isActive: false, lastModifiedById: params.actor },
        include: {
          tokens: true,
        },
      });

      // delete all tokens of this user
      await this.tokensRepository.deleteMany({
        where: { userId: user.id },
      });

      // Publish account deactivated event
      messageBroker.publish({
        message: JSON.stringify({
          data: user,
          actor: params.actor,
        }),
        topic: userDeactivated,
      });

      return {
        success: true,
        data: true,
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
