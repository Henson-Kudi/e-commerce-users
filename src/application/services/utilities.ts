import { TokenType } from '@prisma/client';
import ITokenManager from '../providers/jwtManager';
import IUserTokensRepository from '../repositories/userTokensRepository';
import { TokenEntity } from '../../domain/entities';
import IMessageBroker from '../providers/messageBroker';
import { otpGenerated } from '../../utils/kafka-topics.json';

export async function generateAndSaveAndSendToken(
  tokenManager: ITokenManager,
  tokensRepository: IUserTokensRepository,
  messageBoker: IMessageBroker,
  params: {
    type: TokenType;
    deviceId?: string;
    expireAt: Date;
    userId: string;
    email?: string;
    phone?: string;
  }
): Promise<TokenEntity> {
  const token = tokenManager.generateToken(params.type, {});

  const createdToken = await tokensRepository.create({
    data: {
      token,
      expireAt: params.expireAt,
      userId: params.userId,
      deviceId: params.deviceId,
      type: params.type,
    },
  });

  messageBoker.publish({
    topic: otpGenerated,
    message: JSON.stringify({
      token,
      to: params.email ?? params.phone,
      type: params.email ? 'email' : 'phone',
      template: 'otp',
    }),
  });

  return createdToken;
}
