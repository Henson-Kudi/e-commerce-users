import IGoogleServicesManager from '../../application/providers/googleservicesManager';
import { GoogleAuthClient } from '../../utils/types/oauth';
import { oAuthClient } from '../config/google';

class GoogleServicesManager implements IGoogleServicesManager {
  oAuthClient: GoogleAuthClient = oAuthClient;
}

export default new GoogleServicesManager();
