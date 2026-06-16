const { bucketName, prefix } = require('../config/gcp');
const {
  listGalleryImages,
  uploadGalleryImage,
} = require('../services/galleryService');
const { addLike, addComment } = require('../services/interactionService');

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

async function likeImage(req, res) {
  try {
    const imagePath = req.body?.imagePath;

    if (!imagePath) {
      res.status(400).json({ message: 'imagePath es requerido.' });
      return;
    }

    const interaction = await addLike(imagePath);
    res.json({ imagePath, interaction });
  } catch (error) {
    console.error('Error al dar like:', error);
    res.status(500).json({ message: 'No se pudo registrar el like.' });
  }
}

async function commentImage(req, res) {
  try {
    const imagePath = req.body?.imagePath;
    const author = (req.body?.author || '').trim();
    const text = (req.body?.text || '').trim();

    if (!imagePath) {
      res.status(400).json({ message: 'imagePath es requerido.' });
      return;
    }

    if (!text) {
      res.status(400).json({ message: 'El comentario no puede estar vacio.' });
      return;
    }

    if (text.length > 300) {
      res
        .status(400)
        .json({ message: 'El comentario no debe superar 300 caracteres.' });
      return;
    }

    const interaction = await addComment(imagePath, author, text);
    res.status(201).json({ imagePath, interaction });
  } catch (error) {
    console.error('Error al comentar imagen:', error);
    res.status(500).json({ message: 'No se pudo guardar el comentario.' });
  }
}

module.exports = {
  health,
  getImages,
  uploadImage,
  likeImage,
  commentImage,
};
