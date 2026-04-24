# 🏠 INSTARENTAL — Rent Anything, Anytime

> India's #1 Full-Stack Rental Marketplace — Built with MERN Stack + AI

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-teal?logo=tailwindcss)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-green?logo=mongodb)](https://mongodb.com)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-purple?logo=redux)](https://redux-toolkit.js.org)

---

## 📌 Features

| Feature | Description |
|---|---|
| 🔐 **JWT Auth** | Register/Login with role-based access (User, Vendor, Admin) |
| 🏠 **Homepage** | Hero, search, stats, categories, featured listings, how-it-works |
| 📦 **Products** | Browse 24 seeded listings across all 8 categories from multiple vendors |
| 📅 **Bookings** | Date picker with conflict detection, price calculator |
| 💳 **Payments** | Razorpay order creation + signature-verified checkout |
| ⭐ **Reviews** | Post-rental ratings with auto-computed averages |
| ❤️ **Wishlist** | Save/unsave items with toggle |
| 💬 **In-App Chat** | Vendor ↔ Renter messaging per booking |
| 🤖 **AI Assistant** | InstaBot: rule-based chat with live product suggestions |
| 🏪 **Vendor Panel** | Manage listings, upload images, view bookings |
| 🛡️ **Admin Panel** | User roles, revenue stats, full booking overview |
| 📍 **Location Filter** | City-based search + price range filters |
| 📱 **Responsive** | Mobile-first dark glassmorphism design |

---

## 🧱 Tech Stack

```
Frontend:  React 18 + Vite + Tailwind CSS + Redux Toolkit + Redux Persist
Backend:   Node.js + Express.js + MongoDB (Mongoose)
Auth:      JWT (jsonwebtoken) + bcryptjs
Images:    Cloudinary (production) | Local disk (development)
Payments:  Razorpay
AI:        Rule-based engine (no API key needed)
```

---

## 📁 Folder Structure

```
instaRental-app/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Business logic (8 controllers)
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   ├── wishlistController.js
│   │   ├── adminController.js
│   │   ├── messageController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect + role guard
│   │   ├── errorHandler.js     # Global error handler
│   │   └── uploadMiddleware.js # Cloudinary / local disk
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   └── Message.js
│   ├── routes/                 # 8 route files
│   ├── utils/generateToken.js  # JWT helper
│   ├── seed.js                 # Demo data seeder
│   ├── .env                    # Config (copy to customise)
│   └── server.js               # Entry point (port 5000)
│
└── frontend/
    ├── src/
    │   ├── api/axiosConfig.js  # Auto-attaches JWT token
    │   ├── components/
    │   │   ├── Navbar.jsx      # Sticky glassmorphism nav
    │   │   ├── Footer.jsx
    │   │   ├── ProductCard.jsx # With wishlist toggle
    │   │   ├── StarRating.jsx  # Read-only & interactive
    │   │   ├── Loader.jsx      # Animated spinner
    │   │   └── AIChatBot.jsx   # Floating chat widget
    │   ├── features/           # Redux slices
    │   │   ├── auth/authSlice.js
    │   │   ├── products/productSlice.js
    │   │   ├── bookings/bookingSlice.js
    │   │   └── wishlist/wishlistSlice.js
    │   ├── pages/              # 11 pages
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ProductListPage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── BookingPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── WishlistPage.jsx
    │   │   ├── ChatPage.jsx
    │   │   ├── VendorDashboard.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── store/store.js      # Redux + redux-persist
    │   ├── App.jsx             # Routes + role guards
    │   └── main.jsx
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+
- MongoDB (local) or [MongoDB Atlas](https://mongodb.com/atlas) (free)

### 2. Clone & Install

```bash
git clone <your-repo-url>
cd instaRental-app

# Install root deps (concurrently)
npm install

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

### 3. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/instarental
JWT_SECRET=your_super_secret_key_change_this

# Optional — leave as-is for local dev (uses disk storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Required — Razorpay payment gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx

NODE_ENV=development
```

### 4. Seed Demo Data

```bash
cd backend
npm run seed
```

This creates **24 products across all 8 categories**, 4 vendors, 3 renters, sample bookings & reviews.

```
🔐 Login Credentials:
  Admin   → admin@instarental.com   / admin123
  Vendor  → vendor@instarental.com  / vendor123
  Vendor 2 → nisha.vendor@instarental.com / vendor123
  Vendor 3 → karan.vendor@instarental.com / vendor123
  Vendor 4 → sanya.vendor@instarental.com / vendor123
  User 1  → priya@instarental.com   / user123
  User 2  → arjun@instarental.com   / user123
```

### Seeded Product Catalog (All Categories + Different Vendors)

| Category | Products | Vendors |
|---|---|---|
| Furniture | Luxury 3-Seater Sofa, Ergonomic Office Chair, Foldable Study Desk | Raj Verma, Nisha Kapoor, Karan Nair |
| Electronics | MacBook Pro M3, Sony Alpha A7 IV Camera, 4K Projector 3000 Lumens | Sanya Iyer, Raj Verma, Nisha Kapoor |
| Vehicles | Royal Enfield Classic 350, Maruti Swift 2023, Electric Scooter Ola S1 | Karan Nair, Sanya Iyer, Raj Verma |
| Garments | Designer Bridal Lehenga, Men Sherwani Set Maroon, Cocktail Gown Navy Blue | Nisha Kapoor, Karan Nair, Sanya Iyer |
| Tools | Bosch Power Drill Set, Pressure Washer 2200W, Circular Saw Kit | Raj Verma, Nisha Kapoor, Karan Nair |
| Sports | 4-Person Camping Tent, Badminton Set Pro, Cricket Complete Kit | Sanya Iyer, Raj Verma, Nisha Kapoor |
| Books | UPSC Preparation Bundle, Engineering Semester Stack, Business Classics Collection | Karan Nair, Sanya Iyer, Raj Verma |
| Others | Party Speaker 200W, Baby Stroller Premium, Portable AC Unit | Nisha Kapoor, Karan Nair, Sanya Iyer |

### 5. Run the App

```bash
# From root — starts BOTH servers
npm run dev

# Or individually:
# Backend  → localhost:5000
cd backend && npm run dev

# Frontend → localhost:5173
cd frontend && npm run dev
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user/vendor |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/profile` | User | Get profile |
| PUT | `/api/auth/profile` | User | Update profile |
| GET | `/api/products` | Public | List with filters/sort/pagination |
| POST | `/api/products` | Vendor | Create listing + images |
| GET | `/api/products/featured` | Public | Top 8 rated products |
| GET | `/api/products/my` | Vendor | Own listings |
| GET | `/api/products/:id` | Public | Product detail |
| PUT | `/api/products/:id` | Vendor | Update listing |
| DELETE | `/api/products/:id` | Vendor | Delete listing |
| POST | `/api/bookings` | User | Create booking |
| POST | `/api/bookings/payment-order` | User | Create Razorpay order |
| PUT | `/api/bookings/:id/pay` | User | Verify Razorpay signature and confirm payment |
| GET | `/api/bookings/my` | User | My bookings |
| GET | `/api/bookings/vendor` | Vendor | Received bookings |
| PUT | `/api/bookings/:id/status` | Vendor | Confirm/decline |
| PUT | `/api/bookings/:id/cancel` | User | Cancel booking |
| POST | `/api/reviews` | User | Post review |
| GET | `/api/reviews/:productId` | Public | Get reviews |
| DELETE | `/api/reviews/:id` | User/Admin | Delete review |
| GET | `/api/wishlist` | User | Get wishlist |
| POST | `/api/wishlist/:productId` | User | Toggle wishlist |
| POST | `/api/messages` | User | Send chat message |
| GET | `/api/messages/:bookingId` | User | Get chat history |
| GET | `/api/messages/unread` | User | Unread count |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id` | Admin | Update role/status |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| GET | `/api/admin/bookings` | Admin | All bookings |
| GET | `/api/admin/products` | Admin | All products |
| POST | `/api/ai/chat` | User | AI assistant |
| GET | `/api/health` | Public | Health check |

---

## 🎨 UI Design

- **Theme**: Premium dark mode with glassmorphism cards
- **Colors**: Blue-600 primary, Orange-500 accent, Slate-900 background
- **Fonts**: Inter (Google Fonts)
- **Animations**: Fade-in, hover lift, spin loaders, typing dots
- **Responsive**: Mobile-first with Tailwind breakpoints

---

## 🔒 Security

- Password hashing with **bcryptjs** (12 salt rounds)  
- JWT with 30-day expiry  
- Role-based route guards on frontend + backend  
- CORS restricted to localhost in development  
- Error handling never exposes stack traces in production  

---

## 🚀 Deployment

### Backend → Render.com
1. Push to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all `.env` variables in Render dashboard

### Frontend → Vercel
1. `cd frontend && npm run build`
2. Deploy `dist/` folder to [vercel.com](https://vercel.com)
3. Set env var: `VITE_API_URL=https://your-backend.onrender.com`

> Update `vite.config.js` proxy to point to your live backend URL for production.

---

## 👨‍💻 Built With ❤️

INSTARENTAL — Full-Stack MERN Rental Marketplace  
MIT License © 2026
