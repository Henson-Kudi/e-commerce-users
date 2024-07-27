import { ErrorRequestHandler } from 'express';
import ErrorClass from '../../../domain/valueObjects/customError';
import logger from '../../../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorRequestHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error((err as Error).message, err);
  if (err instanceof ErrorClass) {
    const error = err.toJSON();

    return res.status(error.code).json(error);
  }

  return res.status(err?.code ?? 500).json({ message: err });
};

export default errorRequestHandler;
