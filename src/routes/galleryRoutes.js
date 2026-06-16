const express = require('express');
const { health, getImages } = require('../controllers/galleryController');

const router = express.Router();

router.get('/health', health);
router.get('/api/images', getImages);

module.exports = router;
