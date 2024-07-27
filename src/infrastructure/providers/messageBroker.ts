import { Kafka, Consumer, Producer, Partitioners } from 'kafkajs';
import IMessageBroker from '../../application/providers/messageBroker';
import { kafkaConfig } from '../config/kafka.conf';
import {
  MessageHandler,
  MessageSubscriptionParams,
  PublishMessageParams,
} from '../../utils/types/messageBroker';

class MessageBroker implements IMessageBroker {
  private kafkaClient: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor() {
    this.kafkaClient = new Kafka({ ...kafkaConfig });
    this.producer = this.kafkaClient.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });
    this.consumer = this.kafkaClient.consumer({
      groupId: 'identity-service',
    });
  }

  public async publish(params: PublishMessageParams): Promise<void> {
    try {
      // Connect producer
      await this.producer.connect();

      // Publish message to topic
      await this.producer.send(params);
    } catch (err) {
      // handle retry logic.
      // log error to log system
    } finally {
      // Disconnect producer
      await this.producer.disconnect();
    }
  }

  public async subscribe(
    params: MessageSubscriptionParams,
    callback: MessageHandler
  ): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe(params);
      await this.consumer.run({
        eachMessage: callback,
      });
    } catch (err) {
      // Handle retry logic
      // Log error to log sytem
    }
  }
}

export default new MessageBroker();
