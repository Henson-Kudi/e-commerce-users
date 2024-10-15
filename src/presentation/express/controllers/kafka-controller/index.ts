import { Message } from 'node-rdkafka';
import logger from '../../../../utils/logger';

export default async function kafkaMessageController(
  message: Message
): Promise<void> {
  switch (message.topic) {
    default:
      logger.warn(`No handler for topic: ${message.topic}`);
      break;
  }
}
