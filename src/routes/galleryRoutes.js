const express = require('express');
const {
	health,
	getImages,
	uploadImage,
	likeImage,
	commentImage,
} = require('../controllers/galleryController');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/health', health);
router.get('/api/images', getImages);
router.post('/api/images/upload', upload.single('image'), uploadImage);
router.post('/api/images/like', likeImage);
router.post('/api/images/comment', commentImage);

module.exports = router;
