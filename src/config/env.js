require('dotenv').config();
module.exports = {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  dbPath: process.env.DB_PATH || './data/mghagha.sqlite',
  nodeEnv: process.env.NODE_ENV || 'development',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  appBaseUrl: process.env.APP_BASE_URL || ''
};
