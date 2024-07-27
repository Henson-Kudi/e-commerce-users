import {
  MessageHandler,
  MessageSubscriptionParams,
  PublishMessageParams,
} from '../../utils/types/messageBroker';

export default interface IMessageBroker {
  publish(params: PublishMessageParams): Promise<void>;
  subscribe(
    params: MessageSubscriptionParams,
    callback: MessageHandler
  ): Promise<void>;
  //
  // unsubscribe(topic: string): Promise<void>
  // close(): Promise<void>
  // isConnected(): boolean
  // getClient(): any
  // getSubscriptions(): any
  // getPendingMessages(): any
  // getStats(): any
  // on(event: string, callback: (arg: any) => void): void
  // removeListener(event: string, callback: (arg: any) => void): void
  // removeAllListeners(event?: string): void
  // setMaxListeners(n: number): void
  // getMaxListeners(): number
  // listeners(event: string): Function[]
  // emit(event: string, ...args: any[]): boolean
  // listenerCount(event: string): number
}
