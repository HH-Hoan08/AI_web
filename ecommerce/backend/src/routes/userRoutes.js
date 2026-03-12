// userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price images');
    res.json({ success: true, data: { user } });
  } catch(err) { next(err); }
});

router.patch('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, phone, avatar }, { new: true, runValidators: true });
    res.json({ success: true, data: { user } });
  } catch(err) { next(err); }
});

router.post('/wishlist/:productId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const idx = user.wishlist.indexOf(req.params.productId);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(req.params.productId);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch(err) { next(err); }
});

router.post('/addresses', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch(err) { next(err); }
});

module.exports = router;
