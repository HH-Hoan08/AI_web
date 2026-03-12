/**
 * User Model - Schema cho người dùng
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true,
    maxlength: [50, 'Tên không được vượt quá 50 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
    select: false // Không trả về password khi query
  },
  phone: { type: String, trim: true },
  avatar: { type: String, default: 'default-avatar.webp' },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  // Địa chỉ giao hàng (có thể nhiều địa chỉ)
  addresses: [{
    name: String,
    phone: String,
    street: String,
    ward: String,
    district: String,
    city: String,
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{ type: mongoose.Schema.ObjectId, ref: 'Product' }],
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  googleId: String,
  // Đặt lại mật khẩu
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  // Xác thực email
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  // Thống kê
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastLogin: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: Đơn hàng của user
userSchema.virtual('orders', {
  ref: 'Order',
  foreignField: 'user',
  localField: '_id'
});

// Hash password trước khi save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = undefined;
  next();
});

// So sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Kiểm tra password thay đổi sau khi JWT được tạo
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Tạo token đặt lại mật khẩu
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 phút
  return resetToken;
};

// Filter active users
userSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
