import authenticationService from '../../../../application/services/authService';
import Login from './login';
import Logout from './logout';
import RefreshAccessToken from './refreshAccessToken';
import RequestOtp from './requestOtp';
import VerifyEmail from './verifyEmail';
import VerifyOtp from './verifyotp';
import VerifyPhone from './verifyPhone';

class AuthController {
  private readonly authService = authenticationService;
  login = new Login(this.authService);
  logout = new Logout(this.authService);
  refreshAccessToken = new RefreshAccessToken(this.authService);
  requestOtp = new RequestOtp(this.authService);
  verifyotp = new VerifyOtp(this.authService);
  verifyEmail = new VerifyEmail(this.authService);
  verifyPhone = new VerifyPhone(this.authService);
}

export default new AuthController();
