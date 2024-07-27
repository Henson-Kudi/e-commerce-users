import RequestObject from '../../../utils/types/request';

export default interface IContoller<T> {
  handle(request: RequestObject): Promise<T>;
}
