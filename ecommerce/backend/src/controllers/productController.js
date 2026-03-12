/**
 * Product Controller
 * CRUD sản phẩm, tìm kiếm, lọc
 */
const Product = require('../models/Product');

/**
 * GET /api/v1/products
 * Lấy danh sách sản phẩm với filter, sort, paginate
 */
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, sort = '-createdAt',
      category, brand, minPrice, maxPrice,
      rating, search, isFeatured, isFlashSale
    } = req.query;

    // Build query
    const query = { isPublished: true };

    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (isFeatured) query.isFeatured = true;
    if (isFlashSale) query.isFlashSale = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query.ratingsAverage = { $gte: Number(rating) };

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {
      '-createdAt': { createdAt: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      '-soldCount': { soldCount: -1 },
      '-ratingsAverage': { ratingsAverage: -1 }
    };
    const sortObj = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .select('-description -attributes -variants'),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      results: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: { products }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/products/:id
 * Lấy chi tiết sản phẩm
 */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate({
        path: 'reviews',
        select: 'rating comment user createdAt',
        populate: { path: 'user', select: 'name avatar' },
        options: { limit: 10, sort: { createdAt: -1 } }
      });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    // Tăng viewCount
    await Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    // Sản phẩm liên quan
    const related = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isPublished: true
    }).limit(4).select('name price comparePrice images ratingsAverage slug');

    res.status(200).json({
      success: true,
      data: { product, related }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/products (Admin)
 */
exports.createProduct = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const product = await Product.create(req.body);

    res.status(201).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/products/:id (Admin)
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.status(200).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/products/:id (Admin)
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    // Soft delete - ẩn sản phẩm thay vì xóa hoàn toàn
    await Product.findByIdAndUpdate(req.params.id, { isPublished: false });

    res.status(200).json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/products/search
 * Tìm kiếm sản phẩm
 */
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 8 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Vui lòng nhập từ khóa' });

    const products = await Product.find({
      $text: { $search: q },
      isPublished: true
    }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(Number(limit))
      .select('name price comparePrice images ratingsAverage slug brand');

    res.status(200).json({ success: true, results: products.length, data: { products } });
  } catch (err) {
    next(err);
  }
};
