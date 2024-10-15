import {
  MessageHandler,
  MessageSubscriptionParams,
  PublishMessageParams,
} from '../../utils/types/messageBroker';

export default interface IMessageBroker {
  publish(params: PublishMessageParams): void;
  subscribe(params: MessageSubscriptionParams, callback: MessageHandler): void;
}
