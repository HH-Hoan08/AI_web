/**
 * Auth Middleware
 * Bảo vệ routes cần đăng nhập
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Yêu cầu đăng nhập
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ header hoặc cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra user còn tồn tại
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    // Kiểm tra user có đổi mật khẩu sau khi token được tạo không
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ success: false, message: 'Mật khẩu đã thay đổi. Vui lòng đăng nhập lại' });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token đã hết hạn, vui lòng đăng nhập lại' });
    }
    next(err);
  }
};

/**
 * Middleware: Phân quyền theo role
 * Sử dụng: restrictTo('admin', 'moderator')
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }
    next();
  };
};

/**
 * Middleware: Optional auth (không bắt buộc đăng nhập)
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
    next();
  } catch {
    next(); // Không throw lỗi nếu token invalid
  }
};
