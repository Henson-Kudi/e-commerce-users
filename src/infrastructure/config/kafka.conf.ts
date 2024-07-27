import { KafkaConfig } from 'kafkajs';
import envConf from '../../utils/env.conf';

export const kafkaConfig: KafkaConfig = {
  clientId: envConf.KafkaClientId,
  brokers: envConf.KafkaBrokers,
  //   ssl: process.env.KAFKA_USE_SSL === 'true',
  //   sasl: {
  //     mechanism: process.env.KAFKA_SASL_MECHANISM,
  //     username: process.env.KAFKA_SASL_USERNAME,
  //     password: process.env.KAFKA_SASL_PASSWORD,
  //   },
};
