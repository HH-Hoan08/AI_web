// categoryRoutes.js
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true, parent: null })
      .populate('children').populate('productCount').sort('sortOrder');
    res.json({ success: true, data: { categories } });
  } catch(err) { next(err); }
});

router.post('/', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, data: { category: cat } });
  } catch(err) { next(err); }
});

module.exports = router;
