const { bucketName, prefix } = require('../config/gcp');
const { listGalleryImages } = require('../services/galleryService');

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

module.exports = {
  health,
  getImages,
};
