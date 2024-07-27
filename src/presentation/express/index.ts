import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import envConf from '../../utils/env.conf';
import { Server } from 'http';
import router from './routes';
import errorRequestHandler from './middlewares/errorHandler';
import logger from '../../utils/logger';

const app = express();

const PORT = envConf.PORT;

app.use(
  cors({
    origin: '*',
  })
);

app.use(express.json());

app.use(morgan('dev'));

const baseUrl = '/api/v1';

// This just test. make sure to modify
app.use(`${baseUrl}/identity`, router);

// Attach error handler only attach all other route handlers
app.use(errorRequestHandler);

export default function startExpressServer(): {
  server: Server;
  app: express.Application;
} {
  // { method: 'POST', path: '\\api\\v1\\identity\\groups\\group-roles' },
  //   path
  // method
  // description
  // application
  // module
  // console.log(JSON.stringify(listAllRoutes()?.map((item: any) => {
  //   const path = item.path.replaceAll('\\', '/')
  //   return({
  //   ...item,
  //  path,
  //  description: slugify(path),
  //  application: 'Identity Service',
  //  module: 'Identity'
  // })
  // }), null, 2))
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port http://localhost:${PORT}`);
  });

  return {
    server,
    app,
  };
}
