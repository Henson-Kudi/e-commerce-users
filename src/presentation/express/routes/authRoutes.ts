import { Router } from 'express';
import handleLogin from './handlers/auth/handleLogin';
import refreshJwt from './handlers/auth/refreshJwt';
import handleLogout from './handlers/auth/handleLogout';
import requestOtp from './handlers/auth/requestOtp';
import verifyOtp from './handlers/auth/verifyOtp';
import verifyEmail from './handlers/auth/verifyEmail';
import verifyPhone from './handlers/auth/verifyPhone';

const router = Router();

router.route('/login').post(handleLogin);
router.route('/logout').post(handleLogout);
router.route('/refresh-token').post(refreshJwt);
router.route('/request-otp').post(requestOtp);
router.route('/verify-otp').post(verifyOtp);
router.route('/verify-email').post(verifyEmail);
router.route('/verify-phone').post(verifyPhone);

export default router;
