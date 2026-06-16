const express = require('express');
const {
	health,
	getImages,
	uploadImage,
	likeImage,
	commentImage,
} = require('../controllers/galleryController');
const { upload } = require('../middlewares/uploadMiddleware');
const { optionalAuth, requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/health', health);
router.get('/api/images', optionalAuth, getImages);
router.post('/api/images/upload', upload.single('image'), uploadImage);
router.post('/api/images/like', requireAuth, likeImage);
router.post('/api/images/comment', requireAuth, commentImage);

module.exports = router;
