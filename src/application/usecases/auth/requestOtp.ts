import moment from 'moment';
import {
  Errors,
  OTP_Types,
  ResponseCodes,
  TokenType,
} from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import generateRandomNumber from '../../../utils/generateRandomNumber';
import UseCaseInterface from '../protocols';
import IMessageBroker from '../../providers/messageBroker';
import { otpGenerated } from '../../../utils/kafka-topics.json';
import IUserRepository from '../../repositories/userRepository';
import IUserTokensRepository from '../../repositories/userTokensRepository';

export default class RequestOtpCode
  implements
    UseCaseInterface<
      {
        userId?: string;
        email?: string;
        phone?: string;
        deviceIp?: string;
        userAgent?: string;
        deviceType?: string;
        os?: string;
        browser?: string;
      },
      IReturnValue<{ userId: string; sent: boolean }>
    >
{
  constructor(
    private readonly tokensRepository: IUserTokensRepository,
    private readonly userRepository: IUserRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute({
    userId,
    email,
    phone,
    type,
  }: {
    userId?: string;
    email?: string;
    phone?: string;
    type: OTP_Types;
  }): Promise<IReturnValue<{ userId: string; sent: boolean }>> {
    try {
      if (!userId && !phone && !email) {
        throw new ErrorClass(
          'Missing required fields',
          ResponseCodes.BadRequest,
          null,
          Errors.BadRequest
        );
      }

      const userQuery = userId ? { id: userId } : email ? { email } : { phone };

      // get user
      const foundUser = await this.userRepository.findUnique({
        where: userQuery,
      });

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
        },
      });

      // publish message to sms topic so sms service can send message to given user
      this.messageBroker.publish({
        message: JSON.stringify({
          to: [OTP_Types.Email_Verification, OTP_Types.Password_Reset].includes(
            type
          )
            ? foundUser?.email
            : type === OTP_Types._2FA_Verification
              ? [foundUser.phone, foundUser.email]
              : foundUser.phone,
          message: `Your OTP code is ${otpCode}`,
        }), //value should be email options exposed by email microservice
        topic: otpGenerated,
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
