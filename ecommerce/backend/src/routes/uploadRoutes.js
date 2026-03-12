// uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, restrictTo } = require('../middleware/auth');

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2,9)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WebP, GIF)'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Upload ảnh sản phẩm
router.post('/product-image', protect, restrictTo('admin', 'moderator'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh' });
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, data: { url: imageUrl, filename: req.file.filename } });
  } catch(err) { next(err); }
});

// Upload nhiều ảnh
router.post('/product-images', protect, restrictTo('admin', 'moderator'), upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 ảnh' });
    
    const images = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    }));
    res.json({ success: true, data: { images } });
  } catch(err) { next(err); }
});

// Upload avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh đại diện' });
    
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { avatar: `/uploads/${req.file.filename}` });
    
    res.json({ success: true, data: { avatarUrl: `/uploads/${req.file.filename}` } });
  } catch(err) { next(err); }
});

module.exports = router;
