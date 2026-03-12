# 🛍 LUXURY MARKET — Hệ thống E-Commerce Hoàn Chỉnh

> Website bán hàng trực tuyến cao cấp với đầy đủ chức năng: Frontend React/Vite, Backend Node.js/Express, Database MongoDB.

## 📋 Mục lục

- [Kiến trúc hệ thống](#kiến-trúc)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Cài đặt](#cài-đặt)
- [Chạy local](#chạy-local)
- [API Documentation](#api-documentation)
- [Deploy](#deploy)

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                     │
│              React + Vite + Tailwind CSS                │
│         Zustand (State) + Framer Motion (Anim)          │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP/HTTPS (REST API)
┌─────────────────▼───────────────────────────────────────┐
│                 BACKEND (Node.js)                       │
│     Express.js + JWT Auth + Helmet (Security)           │
│     Rate Limiting + XSS Clean + Mongo Sanitize          │
└─────────────────┬───────────────────────────────────────┘
                  │ Mongoose ODM
┌─────────────────▼───────────────────────────────────────┐
│                DATABASE (MongoDB)                       │
│      Collections: Users, Products, Orders,              │
│                   Categories, Reviews                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc thư mục

```
ecommerce/
├── frontend/                    # React app
│   ├── src/
│   │   ├── components/          # Shared components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── CartSidebar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── SearchOverlay.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Products.jsx
│   │   │       ├── Orders.jsx
│   │   │       └── Users.jsx
│   │   ├── store/
│   │   │   └── index.js         # Zustand stores
│   │   ├── hooks/               # Custom hooks
│   │   │   ├── useProducts.js
│   │   │   ├── useOrders.js
│   │   │   └── useAuth.js
│   │   ├── utils/
│   │   │   ├── formatPrice.js
│   │   │   └── api.js
│   │   └── styles/
│   │       └── globals.css
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   └── ...
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── Category.js
│   │   │   └── Review.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── database/
│   │   │   └── seed.js
│   │   └── server.js
│   ├── uploads/                 # Uploaded images
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🗄 Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (unique, required)",
  "password": "String (hashed, bcrypt)",
  "phone": "String",
  "avatar": "String",
  "role": "enum[user, admin, moderator]",
  "addresses": [{ "street", "ward", "district", "city", "isDefault" }],
  "wishlist": ["ProductId"],
  "isEmailVerified": "Boolean",
  "isActive": "Boolean",
  "totalOrders": "Number",
  "totalSpent": "Number",
  "createdAt": "Date"
}
```

### Products Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "slug": "String (auto-generated, unique)",
  "description": "String",
  "category": "CategoryId (ref)",
  "brand": "String",
  "price": "Number",
  "comparePrice": "Number (original price)",
  "images": [{ "url", "alt", "isPrimary" }],
  "stock": "Number",
  "variants": [{ "name", "options": [{ "value", "priceModifier", "stock" }] }],
  "tags": ["String"],
  "ratingsAverage": "Number",
  "ratingsCount": "Number",
  "soldCount": "Number",
  "isFeatured": "Boolean",
  "isFlashSale": "Boolean",
  "flashSalePrice": "Number",
  "createdAt": "Date"
}
```

### Orders Collection
```json
{
  "_id": "ObjectId",
  "orderNumber": "String (auto LM250120XXXX)",
  "user": "UserId (ref, optional)",
  "customerInfo": { "name", "email", "phone" },
  "shippingAddress": { "street", "ward", "district", "city" },
  "items": [{ "product", "name", "price", "quantity", "image" }],
  "subtotal": "Number",
  "shippingFee": "Number",
  "total": "Number",
  "paymentMethod": "enum[cod, banking, momo, zalopay, vnpay]",
  "paymentStatus": "enum[pending, paid, failed, refunded]",
  "status": "enum[pending, confirmed, processing, shipping, delivered, cancelled]",
  "statusHistory": [{ "status", "note", "updatedAt" }],
  "createdAt": "Date"
}
```

---

## ⚙️ Cài đặt

### Yêu cầu hệ thống
- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0 (local hoặc Atlas)
- **npm** >= 9.0

### 1. Clone project
```bash
git clone https://github.com/yourname/luxe-market.git
cd luxe-market
```

### 2. Cài đặt Backend
```bash
cd backend

# Cài packages
npm install

# Copy và chỉnh sửa env
cp .env.example .env
nano .env  # hoặc code .env

# Tạo thư mục uploads
mkdir -p uploads
```

### 3. Cài đặt Frontend
```bash
cd ../frontend
npm install

# Copy env
cp .env.example .env
```

### Frontend .env
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=LUXURY MARKET
```

---

## 🚀 Chạy local

### Terminal 1 - Backend
```bash
cd backend

# Development (auto-reload)
npm run dev

# Hoặc production
npm start
```

API sẽ chạy tại: http://localhost:5000/api/v1

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

### Seed dữ liệu mẫu
```bash
cd backend
npm run seed
```

Sau khi seed xong:
- **Admin:** admin@luxemarket.vn / Admin@123456
- **User:** minh@example.com / User@123456

---

## 📡 API Documentation

### Authentication
```
POST   /api/v1/auth/register        # Đăng ký
POST   /api/v1/auth/login           # Đăng nhập  
POST   /api/v1/auth/logout          # Đăng xuất
GET    /api/v1/auth/me              # Profile (cần auth)
POST   /api/v1/auth/forgot-password # Quên mật khẩu
PATCH  /api/v1/auth/reset-password/:token
PATCH  /api/v1/auth/update-password # Đổi mật khẩu
```

### Products
```
GET    /api/v1/products             # Danh sách (filter, sort, page)
GET    /api/v1/products/search?q=   # Tìm kiếm
GET    /api/v1/products/:id         # Chi tiết
POST   /api/v1/products             # Tạo (admin)
PATCH  /api/v1/products/:id         # Sửa (admin)
DELETE /api/v1/products/:id         # Xóa (admin)
```

**Query params cho GET /products:**
```
?page=1&limit=12
?sort=-createdAt | price-asc | price-desc | -soldCount | -ratingsAverage
?category=CATEGORY_ID
?brand=Nike
?minPrice=100000&maxPrice=5000000
?rating=4
?isFeatured=true
?isFlashSale=true
```

### Orders
```
POST   /api/v1/orders               # Tạo đơn hàng
GET    /api/v1/orders/my-orders     # Đơn của tôi
GET    /api/v1/orders/:id           # Chi tiết đơn
PATCH  /api/v1/orders/:id/cancel    # Hủy đơn
```

### Admin
```
GET    /api/v1/admin/dashboard      # Thống kê
GET    /api/v1/admin/orders         # Tất cả đơn hàng
PATCH  /api/v1/admin/orders/:id/status
GET    /api/v1/admin/users          # Tất cả users
PATCH  /api/v1/admin/users/:id      # Cập nhật user
```

### Upload
```
POST   /api/v1/upload/product-image    # Upload 1 ảnh
POST   /api/v1/upload/product-images   # Upload nhiều ảnh
POST   /api/v1/upload/avatar           # Upload avatar
```

---

## 🚢 Deploy

### Option 1: Render.com (Miễn phí)

**Backend:**
1. Push code lên GitHub
2. Vào render.com → New Web Service
3. Connect GitHub repo
4. Build command: `npm install`
5. Start command: `npm start`
6. Thêm Environment Variables từ file .env

**Frontend:**
1. Vào render.com → New Static Site
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Thêm `VITE_API_URL=https://your-backend.onrender.com/api/v1`

### Option 2: Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy frontend
cd ../frontend
railway init
railway up
```

### Option 3: VPS (Ubuntu) với PM2 + Nginx

```bash
# Cài Node.js, MongoDB, PM2, Nginx
sudo apt update && sudo apt install -y nodejs npm nginx

# Clone & setup
git clone ... && cd ecommerce/backend
npm install
cp .env.example .env && nano .env

# Chạy với PM2
npm install -g pm2
pm2 start src/server.js --name "luxe-api"
pm2 startup && pm2 save

# Nginx config
sudo nano /etc/nginx/sites-available/luxe-market
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/luxe-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site & restart nginx
sudo ln -s /etc/nginx/sites-available/luxe-market /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# SSL với Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## 🔒 Bảo mật đã triển khai

- ✅ **bcryptjs** - Hash password với salt 12 rounds
- ✅ **JWT** - Stateless authentication với expiry
- ✅ **Helmet** - Bảo vệ HTTP headers
- ✅ **Rate Limiting** - Ngăn brute force (100 req/15min)
- ✅ **CORS** - Chỉ cho phép frontend domain
- ✅ **express-mongo-sanitize** - Ngăn NoSQL injection
- ✅ **xss-clean** - Sanitize input chống XSS
- ✅ **express-validator** - Validate input phía server
- ✅ **httpOnly cookies** - Bảo vệ JWT khỏi XSS
- ✅ **Secure flag** - Cookie chỉ qua HTTPS (production)

---

## ✨ Tính năng nổi bật

| Tính năng | Mô tả |
|-----------|-------|
| 🎨 UI/UX | DM Serif Display + DM Sans, Dark mode, Animations |
| 📱 Responsive | Mobile-first, hoạt động tốt mọi thiết bị |
| 🛒 Cart | Persist qua reload, realtime total |
| 🔍 Tìm kiếm | Full-text search với MongoDB text index |
| ⚡ Flash Sale | Countdown timer thực tế |
| 🔐 Auth | JWT + bcrypt + refresh logic |
| 👑 Admin | Dashboard, CRUD products, orders, users |
| 📦 Upload | Multer - upload ảnh sản phẩm |
| ⭐ Reviews | Rating tự động cập nhật average |

---

## 📝 License

MIT License - Tự do sử dụng và phát triển.

---

**Được xây dựng với ❤️ cho cộng đồng Việt Nam**
