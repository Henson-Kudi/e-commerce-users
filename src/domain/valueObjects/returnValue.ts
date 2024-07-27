import ErrorClass from './customError';

export default interface IReturnValue<T = unknown> {
  success: boolean;
  message?: string;
  data?: T | null;
  error?: ErrorClass;
}

export interface IReturnValueWithPagination<T> {
  success: boolean;
  message?: string;
  data?: {
    data: T | null;
    limit: number;
    total: number;
    page: number;
  };
  error?: ErrorClass;
}
