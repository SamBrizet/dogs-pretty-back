const { bucketName, prefix } = require('../config/gcp');
const {
  listGalleryImages,
  uploadGalleryImage,
} = require('../services/galleryService');

function health(_req, res) {
  res.json({ ok: true, bucket: bucketName, prefix });
}

async function getImages(_req, res) {
  try {
    const response = await listGalleryImages();
    res.json(response);
  } catch (error) {
    console.error('Error al listar imagenes de GCS:', error);
    res.status(500).json({
      message: 'No se pudieron cargar las imagenes desde Google Cloud Storage.',
      details: error.message,
    });
  }
}

async function uploadImage(req, res) {
  try {
    const response = await uploadGalleryImage(req.file);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error al subir imagen a GCS:', error);
    res.status(error.status || 500).json({
      message:
        error.status === 400
          ? error.message
          : 'No se pudo subir la imagen a Google Cloud Storage.',
      details: error.status === 400 ? undefined : error.message,
    });
  }
}

module.exports = {
  health,
  getImages,
  uploadImage,
};
