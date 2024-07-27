import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import rolesAndPermissionsRoutes from './rolesAndPermissionsRoutes';
import envConf from '../../../utils/env.conf';
import groupRoutes from './groupRoutes';

const router = Router();

// AUTH ROUTES
router.use('/auth', authRoutes);

// USER ROUTES
router.use('/users', userRoutes);

// ROLES AND PERMISSONS ROUTES
router.use('/roles', rolesAndPermissionsRoutes);

// GROUP ROUTES
router.use('/groups', groupRoutes);

export default router;

// Use only in dev mode (package is installed with --save-dev)
export function listAllRoutes() {
  if (envConf.NODE_ENV === 'production') {
    return [];
  }

  // eslint-disable-next-line
  const routesLister = require('express-list-routes');
  const baseUrl = '/api/v1/identity';

  const auth = routesLister(authRoutes, { prefix: baseUrl + '/auth' });
  const users = routesLister(userRoutes, { prefix: baseUrl + '/users' });
  const roles = routesLister(rolesAndPermissionsRoutes, {
    prefix: baseUrl + '/roles',
  });
  const groups = routesLister(groupRoutes, { prefix: baseUrl + '/groups' });

  return auth.concat(users).concat(roles).concat(groups);
}
