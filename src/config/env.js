const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: Number(process.env.PORT || 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  gcsBucketPath: process.env.GCS_BUCKET_PATH || 'matrimonioxd/dogs-pretty',
  gcsBucket: process.env.GCS_BUCKET,
  gcsPrefix: process.env.GCS_PREFIX,
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};

module.exports = { env };
