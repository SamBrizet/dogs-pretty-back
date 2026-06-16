const path = require('node:path');
const { storage, bucketName, prefix } = require('../config/gcp');

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '');
}

async function listGalleryImages() {
  const [files] = await storage.bucket(bucketName).getFiles({ prefix });

  const imageFiles = files.filter((file) => {
    const isFolder = file.name.endsWith('/');
    const looksLikeImage = /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(file.name);
    return !isFolder && looksLikeImage;
  });

  const images = await Promise.all(
    imageFiles.map(async (file) => {
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 1000 * 60 * 15,
      });

      return {
        name: path.basename(file.name),
        path: file.name,
        updated: file.metadata.updated,
        size: Number(file.metadata.size || 0),
        url,
      };
    }),
  );

  images.sort((a, b) => new Date(b.updated) - new Date(a.updated));

  return {
    bucket: bucketName,
    prefix,
    count: images.length,
    images,
  };
}

async function uploadGalleryImage(file) {
  if (!file) {
    throw createHttpError(400, 'Debes adjuntar una imagen en el campo image.');
  }

  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    throw createHttpError(400, 'El archivo debe ser una imagen valida.');
  }

  const safeBaseName = sanitizeFileName(path.parse(file.originalname).name);
  const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
  const finalName = `${Date.now()}-${safeBaseName || 'dog-image'}${extension}`;
  const objectPath = prefix ? `${prefix}/${finalName}` : finalName;

  const object = storage.bucket(bucketName).file(objectPath);

  await object.save(file.buffer, {
    resumable: false,
    metadata: {
      contentType: file.mimetype,
    },
  });

  const [url] = await object.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 1000 * 60 * 15,
  });

  return {
    message: 'Imagen subida correctamente.',
    image: {
      name: finalName,
      path: objectPath,
      url,
    },
  };
}

module.exports = {
  listGalleryImages,
  uploadGalleryImage,
};
