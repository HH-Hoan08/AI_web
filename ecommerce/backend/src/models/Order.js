/**
 * Order Model - Schema cho đơn hàng
 */
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, // snapshot tên sản phẩm
  price: { type: Number, required: true }, // snapshot giá
  quantity: { type: Number, required: true, min: 1 },
  image: String,
  variant: { name: String, value: String } // biến thể đã chọn
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  // Thông tin khách hàng (cho phép đặt hàng không cần đăng nhập)
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  // Địa chỉ giao hàng
  shippingAddress: {
    name: String,
    phone: String,
    street: { type: String, required: true },
    ward: String,
    district: String,
    city: { type: String, required: true }
  },
  items: [orderItemSchema],
  // Giá
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: String,
  total: { type: Number, required: true },
  // Thanh toán
  paymentMethod: {
    type: String,
    enum: ['cod', 'banking', 'momo', 'zalopay', 'vnpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentTransactionId: String,
  paidAt: Date,
  // Trạng thái đơn hàng
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
    index: true
  },
  // Lịch sử trạng thái
  statusHistory: [{
    status: String,
    note: String,
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
  }],
  // Giao hàng
  deliveredAt: Date,
  trackingNumber: String,
  shippingProvider: String,
  note: String, // Ghi chú của khách
  cancelReason: String,
  refundAmount: Number,
  refundedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `LM${year}${month}${day}${random}`;
  }
  next();
});

// Sau khi save đơn hàng, cập nhật soldCount của sản phẩm
orderSchema.post('save', async function() {
  if (this.status === 'delivered') {
    const Product = require('./Product');
    for (const item of this.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { soldCount: item.quantity }
      });
    }
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
