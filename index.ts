import startServer from './src';
import logger from './src/utils/logger';

(() => {
  logger.info('Starting server');
  startServer();
})();
