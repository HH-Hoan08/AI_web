/**
 * Product Model - Schema cho sản phẩm
 */
const mongoose = require('mongoose');
const slugify = require('slug');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên sản phẩm'],
    trim: true,
    maxlength: [200, 'Tên sản phẩm không vượt quá 200 ký tự']
  },
  slug: { type: String, unique: true, index: true },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sản phẩm'],
    maxlength: [5000, 'Mô tả không vượt quá 5000 ký tự']
  },
  shortDescription: { type: String, maxlength: 300 },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Vui lòng chọn danh mục']
  },
  brand: { type: String, trim: true },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá sản phẩm'],
    min: [0, 'Giá không được âm']
  },
  comparePrice: { // Giá gốc (trước khi giảm)
    type: Number,
    validate: {
      validator: function(val) { return !val || val >= this.price; },
      message: 'Giá gốc phải lớn hơn giá bán'
    }
  },
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  stock: { type: Number, default: 0, min: [0, 'Tồn kho không được âm'] },
  sku: { type: String, unique: true, sparse: true },
  // Biến thể (màu sắc, kích cỡ)
  variants: [{
    name: String, // e.g., "Màu sắc", "Kích cỡ"
    options: [{
      value: String, // e.g., "Đỏ", "M"
      priceModifier: { type: Number, default: 0 },
      stock: { type: Number, default: 0 }
    }]
  }],
  // Tags và attributes
  tags: [String],
  attributes: [{ key: String, value: String }],
  // SEO
  metaTitle: String,
  metaDescription: String,
  // Trạng thái
  isPublished: { type: Boolean, default: true, index: true },
  isFeatured: { type: Boolean, default: false, index: true },
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: Number,
  flashSaleEnd: Date,
  // Rating tổng hợp (computed)
  ratingsAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: val => Math.round(val * 10) / 10
  },
  ratingsCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  // Người tạo
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes cho tìm kiếm
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ price: 1, ratingsAverage: -1, soldCount: -1 });
productSchema.index({ category: 1, isPublished: 1 });

// Virtual: Reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id'
});

// Virtual: Phần trăm giảm giá
productSchema.virtual('discountPercent').get(function() {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round((1 - this.price / this.comparePrice) * 100);
});

// Auto-generate slug từ tên
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true }) + '-' + Date.now();
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
