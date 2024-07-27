import { OAuth2Client } from 'google-auth-library';
import envConf from '../../utils/env.conf';

export const oAuthClient = new OAuth2Client(
  envConf.google.oauthClientId,
  envConf.google.oauthClientSecret
);
