export default interface UseCaseInterface<T = unknown, Y = unknown> {
  execute(params: T): Promise<Y>;
}
