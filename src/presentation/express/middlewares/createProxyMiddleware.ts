import { Application } from 'express';
import authenticateRequest from './authenticateRequest';
import proxy from 'express-http-proxy';

export default function createProxyMiddleware(app: Application) {
  // app.get('/api/v1/products-service', createProxy('http://localhost:5000/api/v1/products-service',));

  app.use(
    '/api/v1/products-service',
    async (req, res, next) => {
      if (req.method.toLowerCase() === 'get') {
        next();
      } else {
        await authenticateRequest()(req, res, next);
      }
    },
    proxy('http://products-service:5000', {
      proxyReqPathResolver(req) {
        if (!req.url.startsWith('/api/v1/products-service')) {
          return `/api/v1/products-service${req.url}`;
        }

        return req.url;
      },
    })
  );

  app.use(
    '/api/v1/orders-service',
    authenticateRequest(),
    proxy('http://orders-service:3030', {
      proxyReqPathResolver(req) {
        if (!req.url.startsWith('/api/v1/orders-service')) {
          return `/api/v1/orders-service${req.url}`;
        }

        return req.url;
      },
    })
  );

  app.use(
    '/api/v1/payments-service',
    authenticateRequest(),
    proxy('http://payments-service:2000', {
      proxyReqPathResolver(req) {
        if (!req.url.startsWith('/api/v1/payments-service')) {
          return `/api/v1/payments-service${req.url}`;
        }

        return req.url;
      },
    })
  );

  app.use(
    '/api/v1/cms',
    async (req, res, next) => {
      if (req.method.toLowerCase() === 'get') {
        next();
      } else {
        await authenticateRequest()(req, res, next);
      }
    },
    proxy('http://cms-service:5050', {
      proxyReqPathResolver(req) {
        if (!req.url.startsWith('/api/v1/cms')) {
          return `/api/v1/cms${req.url}`;
        }

        return req.url;
      },
    })
  );

  app.use(
    '/api/v1/cart-service',
    authenticateRequest(),
    proxy('http://cart-service:6000', {
      proxyReqPathResolver(req) {
        if (!req.url.startsWith('/api/v1/cart-service')) {
          return `/api/v1/cart-service${req.url}`;
        }

        return req.url;
      },
    })
  );

  app.use(
    '/api/v1/discounts-service',
    authenticateRequest(),
    proxy('http://coupons-service:8000', {
      proxyReqPathResolver(req) {
        if (!req.url.startsWith('/api/v1/discounts-service')) {
          return `/api/v1/discounts-service${req.url}`;
        }

        return req.url;
      },
    })
  );
}
