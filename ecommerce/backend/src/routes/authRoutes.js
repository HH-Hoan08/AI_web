const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Vui lòng nhập họ tên')
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),
  body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Mật khẩu phải ít nhất 8 ký tự')
    .matches(/^(?=.*[A-Z])(?=.*[0-9])/).withMessage('Mật khẩu phải có ít nhất 1 chữ hoa và 1 số')
];

router.post('/register', registerValidation, authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/update-password', protect, authController.updatePassword);

module.exports = router;
