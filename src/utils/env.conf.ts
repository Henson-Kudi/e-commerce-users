/* eslint-disable no-process-env */

export default {
  AppName: "@HK Solutions",
  NODE_ENV: process.env.NODE_ENV || 'development',
  frontEndUrl: process.env.FRONT_END_URL || 'http://localhost:400',
  JWT: {
    AccessToken: {
      secret: process.env.JWT_ACCESS_SECRET || 'accessTokenSecret',
      expiration: { value: 20, unit: 'minutes' },
    },
    RefreshToken: {
      secret: process.env.JWT_REFRESH_SECRET || 'refreshTokenSecret',
      expiration: { value: 1, unit: 'day' },
    },
  },
  PORT: process.env.PORT || 5000,
  KafkaClientId: process.env.KAFKA_CLIENT_ID || 'kafkajs',
  KafkaBrokers: process.env.KAFKA_BROKERS?.split(',') || ['172.15.11.7:9092'],
  KafkaUseSSL: process.env.KAFKA_USE_SSL || 'false',
  google: {
    oauthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
    oauthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
  },
};
