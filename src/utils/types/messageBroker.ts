import {
  ConsumerSubscribeTopics,
  EachMessageHandler,
  ProducerRecord,
} from 'kafkajs';

type MessageHandler = EachMessageHandler;
type MessageSubscriptionParams = ConsumerSubscribeTopics;
type PublishMessageParams = ProducerRecord;

export { MessageHandler, MessageSubscriptionParams, PublishMessageParams };
