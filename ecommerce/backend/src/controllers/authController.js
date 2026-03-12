/**
 * Auth Controller
 * Xử lý đăng ký, đăng nhập, đổi mật khẩu
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Tạo JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Gửi token về client
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true, // Không thể truy cập qua JS (bảo mật XSS)
    secure: process.env.NODE_ENV === 'production', // Chỉ HTTPS trong production
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // Ẩn password trong response
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user }
  });
};

/**
 * POST /api/v1/auth/register
 * Đăng ký tài khoản mới
 */
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email }).select('+password');
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const user = await User.create({ name, email, password, phone });

    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 * Đăng nhập
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    // Tìm user và lấy password field (bị ẩn mặc định)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
    }

    // Cập nhật lastLogin
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/logout
 */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
};

/**
 * GET /api/v1/auth/me
 * Lấy thông tin user hiện tại
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price images');
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 * Quên mật khẩu - gửi email reset
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy email này' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // URL reset (frontend sẽ xử lý)
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // TODO: Gửi email thực tế
    console.log(`Reset URL: ${resetURL}`);

    res.status(200).json({
      success: true,
      message: 'Email đặt lại mật khẩu đã được gửi',
      // Chỉ trả về trong dev để test
      ...(process.env.NODE_ENV === 'development' && { resetURL })
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/auth/reset-password/:token
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/auth/update-password
 * Đổi mật khẩu (đã đăng nhập)
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};
