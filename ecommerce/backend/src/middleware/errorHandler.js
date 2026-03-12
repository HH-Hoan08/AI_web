/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log lỗi trong development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.message = `ID không hợp lệ: ${err.value}`;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.statusCode = 409;
    error.message = `${field} đã tồn tại. Vui lòng dùng giá trị khác`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error.statusCode = 400;
    error.message = messages.join('. ');
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Lỗi máy chủ nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
