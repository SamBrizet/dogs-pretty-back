const app = require('./src/app');
const { env } = require('./src/config/env');
const { bucketName, prefix } = require('./src/config/gcp');

app.listen(env.port, () => {
  console.log(`API dogs-pretty-back escuchando en http://localhost:${env.port}`);
  console.log(`Bucket: ${bucketName}`);
  console.log(`Prefijo: ${prefix || '(raiz del bucket)'}`);
});
