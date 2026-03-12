/**
 * LUXURY MARKET - Seed Data
 * Chạy: node src/database/seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/luxe_market';

const categories = [
  { name: 'Thời trang', slug: 'thoi-trang', icon: '👗', sortOrder: 1 },
  { name: 'Điện tử', slug: 'dien-tu', icon: '📱', sortOrder: 2 },
  { name: 'Giày dép', slug: 'giay-dep', icon: '👟', sortOrder: 3 },
  { name: 'Làm đẹp', slug: 'lam-dep', icon: '💄', sortOrder: 4 },
  { name: 'Nội thất', slug: 'noi-that', icon: '🏠', sortOrder: 5 },
  { name: 'Đồng hồ', slug: 'dong-ho', icon: '⌚', sortOrder: 6 },
  { name: 'Gaming', slug: 'gaming', icon: '🎮', sortOrder: 7 },
  { name: 'Sách', slug: 'sach', icon: '📚', sortOrder: 8 },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Xóa dữ liệu cũ
    console.log('🗑  Xóa dữ liệu cũ...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Review.deleteMany({})
    ]);

    // Tạo categories
    console.log('📂 Tạo danh mục...');
    const createdCategories = await Category.insertMany(categories);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.name] = c._id; });

    // Tạo users
    console.log('👤 Tạo người dùng...');
    const hashedAdminPass = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
    const hashedUserPass = await bcrypt.hash('User@123456', 12);

    const [admin, ...users] = await User.create([
      {
        name: 'Admin LUXE',
        email: process.env.ADMIN_EMAIL || 'admin@luxemarket.vn',
        password: hashedAdminPass,
        role: 'admin',
        isEmailVerified: true,
        isActive: true
      },
      { name: 'Nguyễn Thị Minh', email: 'minh@example.com', password: hashedUserPass, phone: '0901234567', isEmailVerified: true },
      { name: 'Trần Văn Hùng', email: 'hung@example.com', password: hashedUserPass, phone: '0912345678', isEmailVerified: true },
      { name: 'Lê Bảo Châu', email: 'chau@example.com', password: hashedUserPass, phone: '0923456789', isEmailVerified: true },
    ]);

    // Tạo products
    console.log('📦 Tạo sản phẩm...');
    const productsData = [
      {
        name: 'Nike Air Max 2025',
        description: 'Đôi giày thể thao phong cách với công nghệ Air Max tiên tiến. Thiết kế hiện đại, đệm khí Max Air mang lại sự thoải mái tối đa cho mọi hoạt động thể thao và thời trang đường phố.',
        shortDescription: 'Giày thể thao công nghệ Air Max - thoải mái tối đa',
        category: catMap['Giày dép'], brand: 'Nike',
        price: 2850000, comparePrice: 3500000, stock: 50, soldCount: 234,
        tags: ['nike', 'giày thể thao', 'air max'], isFeatured: true,
        images: [{ url: 'https://via.placeholder.com/600x600?text=Nike+Air+Max', isPrimary: true }],
        ratingsAverage: 4.8, ratingsCount: 234, createdBy: admin._id
      },
      {
        name: 'Apple AirPods Pro 3',
        description: 'Tai nghe không dây cao cấp thế hệ mới với tính năng khử tiếng ồn chủ động Adaptive Audio. Âm thanh vòm không gian, pin 30 giờ với case sạc.',
        shortDescription: 'Tai nghe cao cấp - khử tiếng ồn - pin 30 giờ',
        category: catMap['Điện tử'], brand: 'Apple',
        price: 6990000, comparePrice: 8500000, stock: 30, soldCount: 567,
        tags: ['apple', 'airpods', 'tai nghe'], isFeatured: true, isFlashSale: true,
        images: [{ url: 'https://via.placeholder.com/600x600?text=AirPods+Pro+3', isPrimary: true }],
        ratingsAverage: 4.9, ratingsCount: 567, createdBy: admin._id
      },
      {
        name: 'MacBook Pro M4 14"',
        description: 'Laptop MacBook Pro với chip M4 mạnh mẽ nhất từ trước đến nay. Màn hình Liquid Retina XDR 14.2 inch, pin lên đến 22 giờ, RAM 16GB, SSD 512GB.',
        shortDescription: 'Laptop chip M4 - màn hình XDR - pin 22 giờ',
        category: catMap['Điện tử'], brand: 'Apple',
        price: 35000000, stock: 15, soldCount: 89,
        tags: ['apple', 'macbook', 'laptop', 'm4'], isFeatured: true,
        images: [{ url: 'https://via.placeholder.com/600x600?text=MacBook+Pro+M4', isPrimary: true }],
        ratingsAverage: 5.0, ratingsCount: 89, createdBy: admin._id
      },
      {
        name: 'Rolex Datejust 41',
        description: 'Đồng hồ Rolex Datejust cổ điển với mặt số màu champagne và dây kim loại Jubilee. Bộ máy tự động Calibre 3235, chống nước 100m.',
        shortDescription: 'Đồng hồ Rolex cao cấp - bộ máy tự động Calibre 3235',
        category: catMap['Đồng hồ'], brand: 'Rolex',
        price: 45000000, comparePrice: 52000000, stock: 5, soldCount: 12,
        tags: ['rolex', 'đồng hồ', 'luxury'], isFeatured: true,
        images: [{ url: 'https://via.placeholder.com/600x600?text=Rolex+Datejust', isPrimary: true }],
        ratingsAverage: 5.0, ratingsCount: 45, createdBy: admin._id
      },
      {
        name: 'Sony WH-1000XM6',
        description: 'Tai nghe over-ear với tính năng khử tiếng ồn tốt nhất thị trường. Pin 30 giờ nghe nhạc, kết nối Multipoint Bluetooth, phân tích tiếng ồn môi trường real-time.',
        shortDescription: 'Tai nghe khử ồn số 1 - pin 30 giờ - Bluetooth 5.3',
        category: catMap['Điện tử'], brand: 'Sony',
        price: 8500000, comparePrice: 9900000, stock: 25, soldCount: 678,
        tags: ['sony', 'tai nghe', 'noise cancelling'], isFeatured: true, isFlashSale: true,
        images: [{ url: 'https://via.placeholder.com/600x600?text=Sony+WH-1000XM6', isPrimary: true }],
        ratingsAverage: 4.9, ratingsCount: 678, createdBy: admin._id
      },
      {
        name: 'Adidas Ultraboost 24',
        description: 'Giày chạy bộ với đế Boost energy-return mang lại cảm giác bật nảy tuyệt vời. Upper Primeknit+ thích ứng với mọi chuyển động của bàn chân.',
        shortDescription: 'Giày chạy bộ - đế Boost - Primeknit+',
        category: catMap['Giày dép'], brand: 'Adidas',
        price: 3200000, comparePrice: 4000000, stock: 40, soldCount: 423,
        tags: ['adidas', 'ultraboost', 'giày chạy bộ'],
        images: [{ url: 'https://via.placeholder.com/600x600?text=Adidas+Ultraboost', isPrimary: true }],
        ratingsAverage: 4.6, ratingsCount: 423, createdBy: admin._id
      },
      {
        name: 'Chanel No. 5 EDP 100ml',
        description: 'Nước hoa huyền thoại Chanel No.5 phiên bản Eau de Parfum với hương thơm floral-aldehyde đặc trưng. Được tạo ra năm 1921 bởi Ernest Beaux.',
        shortDescription: 'Nước hoa huyền thoại - floral aldehyde - 100ml',
        category: catMap['Làm đẹp'], brand: 'Chanel',
        price: 3200000, comparePrice: 3800000, stock: 20, soldCount: 312,
        tags: ['chanel', 'nước hoa', 'no5'], isFeatured: true,
        images: [{ url: 'https://via.placeholder.com/600x600?text=Chanel+No5', isPrimary: true }],
        ratingsAverage: 4.8, ratingsCount: 312, createdBy: admin._id
      },
      {
        name: 'Samsung Galaxy S25 Ultra',
        description: 'Flagship Android mạnh nhất với bút S Pen tích hợp. Camera 200MP, Snapdragon 8 Elite, màn hình Dynamic AMOLED 2X 6.9 inch, pin 5000mAh sạc nhanh 45W.',
        shortDescription: 'Flagship Android - camera 200MP - S Pen - Snapdragon 8 Elite',
        category: catMap['Điện tử'], brand: 'Samsung',
        price: 28000000, comparePrice: 32000000, stock: 35, soldCount: 156,
        tags: ['samsung', 'galaxy', 's25', 'điện thoại'], isFlashSale: true,
        images: [{ url: 'https://via.placeholder.com/600x600?text=Samsung+S25+Ultra', isPrimary: true }],
        ratingsAverage: 4.7, ratingsCount: 156, createdBy: admin._id
      },
    ];

    const createdProducts = await Product.create(productsData);

    // Tạo reviews
    console.log('⭐ Tạo đánh giá...');
    const reviewsData = [
      { user: users[0]._id, product: createdProducts[0]._id, rating: 5, comment: 'Giày đẹp lắm, đi rất thoải mái, giao hàng nhanh. 5 sao không chần chừ!', isVerifiedPurchase: true },
      { user: users[1]._id, product: createdProducts[0]._id, rating: 4, comment: 'Chất lượng tốt, đúng như hình. Chỉ hơi to hơn size thông thường 1 chút.', isVerifiedPurchase: true },
      { user: users[2]._id, product: createdProducts[1]._id, rating: 5, comment: 'AirPods Pro 3 nghe hay vãi, khử tiếng ồn cực đỉnh. Xứng đáng với giá tiền!', isVerifiedPurchase: true },
      { user: users[0]._id, product: createdProducts[4]._id, rating: 5, comment: 'Sony WH-1000XM6 là tai nghe tốt nhất mình từng dùng. Khử ồn siêu đỉnh!', isVerifiedPurchase: true },
    ];
    await Review.create(reviewsData);

    console.log(`
    ╔═══════════════════════════════════╗
    ║      SEED DATA THÀNH CÔNG! ✅     ║
    ╠═══════════════════════════════════╣
    ║  👤 ${createdCategories.length} danh mục              ║
    ║  📦 ${createdProducts.length} sản phẩm               ║
    ║  👥 ${users.length + 1} người dùng (1 admin)         ║
    ║  ⭐ ${reviewsData.length} đánh giá               ║
    ╠═══════════════════════════════════╣
    ║  🔑 Admin:                        ║
    ║  📧 ${process.env.ADMIN_EMAIL || 'admin@luxemarket.vn'} ║
    ║  🔒 ${process.env.ADMIN_PASSWORD || 'Admin@123456'}     ║
    ╚═══════════════════════════════════╝
    `);

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed data:', err);
    process.exit(1);
  }
};

seedDB();
