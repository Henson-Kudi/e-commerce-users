import {
  MessageKey,
  MessageHeader,
  NumberNullUndefined,
  SubscribeTopicList,
  Message,
} from 'node-rdkafka';

type MessageHandler = (data: Message) => Promise<void>;
type MessageSubscriptionParams = SubscribeTopicList;

type PublishMessageParams = {
  topic: string;
  message: string;
  partition?: NumberNullUndefined;
  key?: MessageKey;
  headers?: MessageHeader[];
};

export { MessageHandler, MessageSubscriptionParams, PublishMessageParams };
