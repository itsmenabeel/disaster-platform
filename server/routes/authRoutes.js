const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, deleteMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.route('/me')
  .get(protect, getMe)
  .put(protect, updateMe)
  .delete(protect, deleteMe);

module.exports = router;
