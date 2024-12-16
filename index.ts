import { initSuperAdmin } from './initSuperAdmin';
import startServer from './src';
import logger from './src/utils/logger';

(async () => {
  logger.info('Starting server');
  startServer();

  // Initialise user with superadmin role
  const sup = await initSuperAdmin();
})();
