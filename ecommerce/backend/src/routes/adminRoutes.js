// adminRoutes.js - Dashboard thống kê
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));

// Dashboard tổng quan
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalUsers, totalProducts, totalOrders,
      revenue, pendingOrders, recentOrders
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isPublished: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ status: 'pending' }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email')
    ]);

    // Doanh thu 7 ngày qua
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: 'delivered' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Top sản phẩm bán chạy
    const topProducts = await Product.find({ isPublished: true })
      .sort({ soldCount: -1 }).limit(5)
      .select('name price soldCount images ratingsAverage');

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers, totalProducts, totalOrders,
          totalRevenue: revenue[0]?.total || 0,
          pendingOrders
        },
        dailyRevenue,
        topProducts,
        recentOrders
      }
    });
  } catch(err) { next(err); }
});

// Quản lý users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 })
        .skip((Number(page)-1)*Number(limit)).limit(Number(limit)),
      User.countDocuments(query)
    ]);
    res.json({ success: true, total, data: { users } });
  } catch(err) { next(err); }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { user } });
  } catch(err) { next(err); }
});

module.exports = router;
