import { registerAs } from '@nestjs/config';
import { NodeEnv } from 'src/common/enums';

export const getAppConfig = () => ({
  nodeEnv: process.env.NODE_ENV || NodeEnv.Local,
  appName: process.env.APP_NAME || 'Notification Service',
  appPort: parseInt(process.env.APP_PORT || '9005'),
  isProductionEnv: process.env.NODE_ENV === NodeEnv.Production,
  frontendAdminPortalUrl: process.env.FRONTEND_ADMIN_PORTAL_URL,
  frontendUserPortalUrl: process.env.FRONTEND_USER_PORTAL_URL,
  trustProxy: process.env.APP_TRUST_PROXY === 'true' ? 1 : false,
  appUrl: process.env.APP_URL,
});

export default registerAs('app', getAppConfig);
