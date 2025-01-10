import IMessageBroker from '../../application/providers/messageBroker';
import {
  PublishMessageParams,
  MessageHandler,
  MessageSubscriptionParams,
} from '../../utils/types/messageBroker';
import Kafka from 'node-rdkafka';
import logger from '../../utils/logger';
import getKafkaConfig from '../../utils/getKafkaConfig';
import moment from 'moment';
import envConf from '../../utils/env.conf';
import path from 'path';

export class MessageBroker implements IMessageBroker {
  private producer: Kafka.Producer;
  private consumer: Kafka.KafkaConsumer;
  private readonly caKey = path.join(envConf.baseDir, 'certs/ca.pem')
  private readonly serviceCert = path.join(envConf.baseDir, 'certs/service.cert')
  private readonly serviceKey = path.join(envConf.baseDir, 'certs/service.key')

  constructor() {
    const config = getKafkaConfig('kafkaclient.properties');

    this.producer = new Kafka.Producer({
      'metadata.broker.list': envConf.kafka.url,
      'security.protocol': 'ssl',
      'ssl.ca.location': this.caKey,
      'ssl.certificate.location': this.serviceCert,
      'ssl.key.location': this.serviceKey,
      'log.connection.close': true
    });

    this.consumer = new Kafka.KafkaConsumer(
      {
        'security.protocol': 'ssl',
        'ssl.ca.location': this.caKey,
        'ssl.certificate.location': this.serviceCert,
        'ssl.key.location': this.serviceKey,
        'log.connection.close': true,
        'group.id': 'users-group',
        'metadata.broker.list': envConf.kafka.url,
      },
      {
        'auto.offset.reset': 'earliest',
      }
    );

    this.__init_consumer();
    this.__init_producer();
  }

  private __init_producer(): void {
    this.producer.connect();

    this.producer
      .on('ready', (infos) => {
        logger.info(`Producer connected to ${infos.name}`);
      })
      .on('event.error', (err) => {
        logger.error('Producer connection error');
        logger.error(err.message, err);
      })
      .on('connection.failure', (err) => {
        logger.error('Failed to connect producer to kafka server');
        logger.error(err.message, err);
      })
      .on('delivery-report', (err, report) => {
        if (err) {
          logger.error(err.message, err);
          return;
        }

        logger.info(
          `Message delivered to topic: ${report.topic}, partition: ${report.partition}, offset: ${report.offset}`
        );
      });
  }

  private __init_consumer(): void {
    this.consumer.connect();
    this.consumer
      .on('ready', (infos) => {
        logger.info(`Consumer connected to ${infos.name}`);
      })
      .on('event.error', (err) => {
        logger.error('Consumer connection error');
        logger.error(err.message, err);
      })
      .on('connection.failure', (err) => {
        logger.error('Failed to connect consumer to kafka server');
        logger.error(err.message, err);
      });
  }

  public publish(params: PublishMessageParams): void {
    try {
      if (!this.producer.isConnected()) {
        logger.warn('Producer not connected');
        logger.info('Retrying connection');
        this.__init_producer();
      }
      // Connect producer

      this.producer.produce(
        params.topic,
        null,
        Buffer.from(params.message),
        params.key,
        moment.now(),
        undefined,
        params?.headers
      );
    } catch (err) {
      // handle retry logic.
      // log error to log system
      logger.error((err as Error).message, err);
    }
  }

  public subscribe(
    topics: MessageSubscriptionParams,
    callback: MessageHandler
  ): void {
    if (!topics.length) {
      logger.warn('No topics provided for subscription');
      return;
    }
    try {
      if (!this.consumer.isConnected) {
        logger.warn('Consumer not connected');
        logger.info('Retrying connection');
        this.__init_consumer();
      }

      this.consumer.subscribe(topics);
      logger.info(`Subscribed to topics ${topics}`);
      this.consumer.consume();
      this.consumer.on('data', callback);
    } catch (err) {
      // Handle retry logic
      // Log error to log sytem
      logger.error((err as Error).message, err);
    }
  }

  public disconnect(): void {
    this.producer.disconnect();
    this.consumer.disconnect();
  }
}

export default new MessageBroker();
