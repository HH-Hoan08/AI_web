const mongoose = require('mongoose');
const Product = require('./Product');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: true },
  order: { type: mongoose.Schema.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1000 },
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

// Mỗi user chỉ review 1 lần mỗi sản phẩm
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Cập nhật rating trung bình sau khi có review mới
reviewSchema.statics.calcAverageRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating,
      ratingsCount: stats[0].count
    });
  } else {
    await Product.findByIdAndUpdate(productId, { ratingsAverage: 0, ratingsCount: 0 });
  }
};

reviewSchema.post('save', function() { this.constructor.calcAverageRating(this.product); });
reviewSchema.post('remove', function() { this.constructor.calcAverageRating(this.product); });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
