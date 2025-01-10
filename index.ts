import { initSuperAdmin } from './initSuperAdmin';
import startServer from './src';
// import messageBroker from './src/infrastructure/providers/messageBroker';
import logger from './src/utils/logger';

(async () => {
  logger.info('Starting server');
  startServer();

  // messageBroker

  // Initialise user with superadmin role
  const sup = await initSuperAdmin();
})();
