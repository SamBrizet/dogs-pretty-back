const express = require('express');
const { loginUser, registerUser, me } = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/api/auth/login', loginUser);
router.post('/api/auth/register', registerUser);
router.get('/api/auth/me', requireAuth, me);

module.exports = router;
