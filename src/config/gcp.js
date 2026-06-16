const fs = require('node:fs');
const path = require('node:path');
const { Storage } = require('@google-cloud/storage');
const { env } = require('./env');

const projectRoot = path.resolve(__dirname, '..', '..');

function parseInlineCredentials(rawValue) {
  try {
    return JSON.parse(rawValue);
  } catch {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS contiene JSON invalido.',
    );
  }
}

function resolveCredentialsOptions() {
  if (env.googleApplicationCredentials) {
    const rawValue = env.googleApplicationCredentials.trim();

    if (rawValue.startsWith('{')) {
      return {
        credentials: parseInlineCredentials(rawValue),
      };
    }

    return {
      keyFilename: rawValue,
    };
  }

  const credentialsFile = fs
    .readdirSync(projectRoot)
    .find((entry) => entry.endsWith('.json'));

  if (!credentialsFile) {
    throw new Error(
      'No se encontro un archivo JSON de credenciales en la raiz del proyecto.',
    );
  }

  return {
    keyFilename: path.join(projectRoot, credentialsFile),
  };
}

function resolveBucketAndPrefix() {
  const [bucketName, ...prefixParts] = env.gcsBucketPath
    .split('/')
    .filter(Boolean);

  const resolvedBucketName = env.gcsBucket || bucketName;
  const resolvedPrefix = env.gcsPrefix || prefixParts.join('/');

  if (!resolvedBucketName) {
    throw new Error(
      'No se pudo resolver el bucket. Define GCS_BUCKET_PATH o GCS_BUCKET.',
    );
  }

  return {
    bucketName: resolvedBucketName,
    prefix: resolvedPrefix,
  };
}

const credentialsOptions = resolveCredentialsOptions();
const { bucketName, prefix } = resolveBucketAndPrefix();

if (credentialsOptions.keyFilename) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsOptions.keyFilename;
}

const storage = new Storage(credentialsOptions);

module.exports = {
  storage,
  bucketName,
  prefix,
};
