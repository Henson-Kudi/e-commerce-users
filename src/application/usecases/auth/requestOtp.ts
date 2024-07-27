import moment from 'moment';
import { Errors, ResponseCodes, TokenType } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import generateRandomNumber from '../../../utils/generateRandomNumber';
import UseCaseInterface from '../protocols';
import IMessageBroker from '../../providers/messageBroker';
import { sendEmail, sendMessage } from '../../../utils/kafka-topics.json';
import IUserRepository from '../../repositories/userRepository';
import IUserTokensRepository from '../../repositories/userTokensRepository';

export default class RequestOtpCode
  implements
    UseCaseInterface<
      {
        userId?: string;
        email?: string;
        phone?: string;
        device: string;
        ip: string;
      },
      IReturnValue<{ userId: string; sent: boolean }>
    >
{
  constructor(
    private readonly tokensRepository: IUserTokensRepository,
    private readonly userRepository: IUserRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(params: {
    userId?: string;
    email?: string;
    phone?: string;
    device?: string;
    ip?: string;
  }): Promise<IReturnValue<{ userId: string; sent: boolean }>> {
    try {
      // get user
      const foundUser = (
        await this.userRepository.find({
          where: {
            OR: [
              { email: params.email },
              { id: params.userId },
              { phone: params.phone },
            ],
          },
          take: 1,
        })
      )[0];

      if (!foundUser) {
        return {
          success: false,
          error: new ErrorClass(
            'User not found',
            ResponseCodes.NotFound,
            null,
            Errors.NotFound
          ),
          message: 'User not found',
        };
      }

      const otpCode = generateRandomNumber(6);

      // Delete all previous otps of same type for this user
      await this.tokensRepository.deleteMany({
        where: {
          userId: foundUser.id,
          type: TokenType.OTP,
        },
      });

      // Save in db
      await this.tokensRepository.create({
        data: {
          token: otpCode,
          userId: foundUser.id,
          expireAt: moment().add(10, 'minutes').toDate(),
          type: TokenType.OTP,
          device: params.device,
          ip: params.ip,
        },
      });

      // if phone or userId was supplied, send otp to user phone number
      if ((params.phone || params.userId) && foundUser.phone) {
        // publish message to sms topic so sms service can send message to given user
        await this.messageBroker.publish({
          messages: [
            {
              value: JSON.stringify({
                to: foundUser?.phone,
                message: `Your OTP code is ${otpCode}`,
              }),
            },
          ],
          topic: sendMessage,
        });

        return {
          success: true,
          data: {
            userId: foundUser.id,
            sent: true,
          },
          message: 'OTP sent successfully',
        };
      }

      // publish message to sms topic so sms service can send message to given user
      await this.messageBroker.publish({
        messages: [
          {
            value: JSON.stringify({
              to: foundUser?.email,
              message: `Your OTP code is ${otpCode}`,
            }), //value should be email options exposed by email microservice
          },
        ],
        topic: sendEmail,
      });

      return {
        success: true,
        data: {
          userId: foundUser.id,
          sent: true,
        },
        message: 'OTP sent successfully',
      };
    } catch (err) {
      const error = err as Error;

      return {
        success: false,
        error: new ErrorClass(
          error.message,
          ResponseCodes.ServerError,
          null,
          Errors.ServerError
        ),
        message: error.message,
      };
    }
  }
}
