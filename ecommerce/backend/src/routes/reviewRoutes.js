// reviewRoutes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

router.get('/product/:productId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((Number(page)-1)*Number(limit))
      .limit(Number(limit));
    const total = await Review.countDocuments({ product: req.params.productId, isApproved: true });
    res.json({ success: true, total, data: { reviews } });
  } catch(err) { next(err); }
});

router.post('/', protect, async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: { review } });
  } catch(err) { next(err); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy review' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền' });
    }
    await review.remove();
    res.json({ success: true, message: 'Đã xóa review' });
  } catch(err) { next(err); }
});

module.exports = router;
