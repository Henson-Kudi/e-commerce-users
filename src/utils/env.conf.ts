/* eslint-disable no-process-env */

export default {
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
};
