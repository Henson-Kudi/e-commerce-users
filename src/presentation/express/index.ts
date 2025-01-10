import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import envConf from '../../utils/env.conf';
import { Server } from 'http';
import router from './routes';
import errorRequestHandler from './middlewares/errorHandler';
import logger from '../../utils/logger';
import addDeviceDetail from './middlewares/addDeviceDetails';
import createProxyMiddleware from './middlewares/createProxyMiddleware';

const app = express();

const PORT = envConf.PORT;

app.use(
  cors({
    origin: (req, cb) => cb(null, true),
    credentials: true,
  })
);

// Add morgan for dev api route logging only
if (envConf.NODE_ENV !== 'production') {
  // Add proxy middleware for dev api route proxy (proxy requests to required microservices with authenticated jwt headers)
  createProxyMiddleware(app);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  app.use(require('morgan')('dev')); // morgan for api route logging
}

app.use(express.json());

// extend headers with the addHeaders middleware
app.use(addDeviceDetail);

const baseUrl = '/api/v1/users-service';

// This just test. make sure to modify
app.use(`${baseUrl}`, router);

// Attach error handler only attach all other route handlers
app.use(errorRequestHandler);

export default function startExpressServer(): {
  server: Server;
  app: express.Application;
} {
  const server = app.listen(PORT, () => {
    logger.info(`Server running on: http://localhost:${PORT}`);
  });

  return {
    server,
    app,
  };
}
