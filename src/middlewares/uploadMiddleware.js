const multer = require('multer');

const storage = multer.memoryStorage();
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/avif',
];

const upload = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(null, true);
      return;
    }

    const error = new Error(
      'Formato de archivo no permitido. Usa PNG, JPG, WEBP, GIF, BMP o AVIF.',
    );
    error.code = 'UNSUPPORTED_FILE_TYPE';
    callback(error);
  },
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

module.exports = {
  upload,
};
