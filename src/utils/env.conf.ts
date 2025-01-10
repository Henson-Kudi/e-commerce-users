/* eslint-disable no-process-env */

export default {
  baseDir: process.cwd(),
  AppName: '@HK Solutions',
  NODE_ENV: process.env.NODE_ENV || 'development',
  frontEndUrl: process.env.FRONT_END_URL || 'http://localhost:400',
  JWT: {
    AccessToken: {
      secret: process.env.JWT_ACCESS_SECRET || 'accessTokenSecret',
      expiration: { value: 20, unit: 'minutes' },
    },
    RefreshToken: {
      secret: process.env.JWT_REFRESH_SECRET || 'refreshTokenSecret',
      expiration: { value: 15, unit: 'days' },
    },
  },
  PORT: process.env.PORT || 4000,
  google: {
    oauthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
    oauthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3Region: process.env.AWS_S3REGION || '',
    s3BucketName: process.env.AWS_S3_BUCKET_NAME || '',
  },
  otherServices: {
    productsService: process.env.PRODUCTS_SERVICE_BASE_URL || 'http://products-service:5000',
    couponsService: process.env.COUPONS_SERVICE_BASE_URL || 'http://products-service:5000',
    cmsService: process.env.CMS_SERVICE_BASE_URL || 'http://cms-service:5050',
    cartService: process.env.CART_SERVICE_BASE_URL || 'http://cart-service:6000',
    ordersService: process.env.ORDERS_SERVICE_BASE_URL || 'http://orders-service:3030',
    paymentsService: process.env.PAYMENTS_SERVICE_BASE_URL || 'http://payments-service:2000',
  },
  kafka: {
    url: process.env.KAFKA_URL,
    host: process.env.KAFKA_HOST,
    port: process.env.KAFKA_PORT,
    caCertPath: 'certs/ca.'
  }
};
