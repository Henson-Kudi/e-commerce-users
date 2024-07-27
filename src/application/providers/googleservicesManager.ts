import { GoogleAuthClient } from '../../utils/types/oauth';

export default interface IGoogleServicesManager {
  oAuthClient: GoogleAuthClient;
}
