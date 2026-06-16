const path = require('node:path');
const { storage, bucketName, prefix } = require('../config/gcp');

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

module.exports = {
  listGalleryImages,
};
