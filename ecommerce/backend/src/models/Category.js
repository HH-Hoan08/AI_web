/**
 * Category Model
 */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, unique: true },
  description: String,
  icon: String,
  image: String,
  parent: { type: mongoose.Schema.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true, toJSON: { virtuals: true } });

categorySchema.virtual('children', {
  ref: 'Category', foreignField: 'parent', localField: '_id'
});
categorySchema.virtual('productCount', {
  ref: 'Product', foreignField: 'category', localField: '_id', count: true
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
