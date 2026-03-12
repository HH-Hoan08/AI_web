/**
 * Order Controller
 * Tạo và quản lý đơn hàng
 */
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * POST /api/v1/orders
 * Tạo đơn hàng mới
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { customerInfo, shippingAddress, items, paymentMethod, note, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Đơn hàng phải có ít nhất 1 sản phẩm' });
    }

    // Xác minh sản phẩm và tính giá
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `${product.name} không đủ hàng trong kho` });
      }

      const price = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
        image: product.images[0]?.url,
        variant: item.variant
      });

      subtotal += price * item.quantity;
    }

    // Phí vận chuyển (miễn phí nếu > 500k)
    const shippingFee = subtotal >= 500000 ? 0 : 30000;

    // Giảm giá coupon (TODO: implement coupon logic)
    let discount = 0;

    const total = subtotal + shippingFee - discount;

    // Tạo đơn hàng
    const order = await Order.create({
      user: req.user?.id,
      customerInfo,
      shippingAddress,
      items: orderItems,
      subtotal,
      shippingFee,
      discount,
      couponCode,
      total,
      paymentMethod,
      note,
      statusHistory: [{ status: 'pending', note: 'Đơn hàng được tạo' }]
    });

    // Giảm tồn kho
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Cập nhật thống kê user
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { totalOrders: 1, totalSpent: total }
      });
    }

    const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: { order: populatedOrder }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/orders/my-orders
 * Lịch sử đơn hàng của user
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user.id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('orderNumber status total items paymentMethod createdAt');

    const total = await Order.countDocuments(query);

    res.status(200).json({ success: true, total, data: { orders } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/orders/:id
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images slug');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Chỉ owner hoặc admin mới xem được
    if (order.user && order.user.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    res.status(200).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/orders/:id/cancel
 * Hủy đơn hàng
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Không thể hủy đơn hàng ở trạng thái này' });
    }

    // Hoàn lại tồn kho
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = 'cancelled';
    order.cancelReason = req.body.reason || 'Khách hàng yêu cầu hủy';
    order.statusHistory.push({ status: 'cancelled', note: order.cancelReason, updatedBy: req.user?.id });
    await order.save();

    res.status(200).json({ success: true, message: 'Đã hủy đơn hàng', data: { order } });
  } catch (err) {
    next(err);
  }
};

// ===== ADMIN =====

/**
 * GET /api/v1/admin/orders (Admin)
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.orderNumber = new RegExp(search, 'i');

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    res.status(200).json({ success: true, total, data: { orders } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/orders/:id/status (Admin)
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    order.status = status;
    order.statusHistory.push({ status, note, updatedBy: req.user.id });

    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }

    await order.save();

    res.status(200).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};
