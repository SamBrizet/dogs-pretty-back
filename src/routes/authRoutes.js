const express = require('express');
const { loginUser, me } = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/api/auth/login', loginUser);
router.get('/api/auth/me', requireAuth, me);

module.exports = router;
