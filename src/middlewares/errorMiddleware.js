const multer = require('multer');

function errorMiddleware(error, _req, res, _next) {
  if (!error) {
    res.status(500).json({
      message: 'Error inesperado en el servidor.',
    });
    return;
  }

  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      message: 'La imagen supera el tamano maximo de 10MB.',
    });
    return;
  }

  if (error.code === 'UNSUPPORTED_FILE_TYPE') {
    res.status(400).json({
      message: error.message,
    });
    return;
  }

  res.status(error.status || 500).json({
    message: error.status ? error.message : 'Error interno del servidor.',
    details: error.status ? undefined : error.message,
  });
}

module.exports = {
  errorMiddleware,
};
