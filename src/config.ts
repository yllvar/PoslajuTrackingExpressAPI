export const CONFIG = {
  PORT: process.env.PORT || 3000,
  POSLAJU_URL: 'https://track.pos.com.my/postal-services/quick-access/',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  DEBUG: process.env.DEBUG === 'true',
};

