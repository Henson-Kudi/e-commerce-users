import { ResponseCodes } from '../enums';

export default class ErrorClass extends Error {
  constructor(
    message: string,
    public code: ResponseCodes,
    public data?: unknown,
    name?: string
  ) {
    super(message);
    this.name = name ?? 'Error';

    // Capture stack trace
    this.stack = new Error(message).stack;
  }

  // Call toJSON to get valid json to send to frontend or to send response
  toJSON() {
    return {
      message: this.message,
      code: this.code,
      data: this?.data,
      name: this.name,
    };
  }
}
