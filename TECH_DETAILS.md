# 📚 INSTARENTAL — Detailed Tech Stack & Project Architecture

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Backend — Deep Dive](#3-backend--deep-dive)
4. [Frontend — Deep Dive](#4-frontend--deep-dive)
5. [Database Design](#5-database-design)
6. [Authentication System](#6-authentication-system)
7. [File Upload System](#7-file-upload-system)
8. [Payment Integration](#8-payment-integration)
9. [AI Assistant](#9-ai-assistant)
10. [Real-Time Chat](#10-real-time-chat)
11. [State Management](#11-state-management)
12. [API Architecture](#12-api-architecture)
13. [Security Practices](#13-security-practices)
14. [Folder Structure Explained](#14-folder-structure-explained)

---

## 1. Project Overview

**INSTARENTAL** is a **full-stack rental marketplace** built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It lets users list, browse and rent items across categories like Furniture, Electronics, Vehicles, Garments, Tools, and Sports.

### Core User Roles
| Role | Capabilities |
|------|-------------|
| **User (Renter)** | Browse, search, book items, review, wishlist, chat |
| **Vendor (Owner)** | All User capabilities + list items, manage bookings |
| **Admin** | Full platform control — manage all users, bookings, listings |

### Architecture Pattern
```
Client (React SPA) ←→ REST API (Express) ←→ MongoDB Atlas/Local
                           ↕
                    Cloudinary (images)
                    Stripe (payments)
```

---

## 2. Technology Stack

### 🖥️ Frontend
| Technology | Version | Why Used |
|----------|---------|---------|
| **React.js** | 18.x | Component-based UI library by Meta |
| **Vite** | 5.x | Lightning-fast build tool (replaces CRA) |
| **Tailwind CSS** | 3.x | Utility-first CSS framework for rapid styling |
| **Redux Toolkit** | 2.x | Official Redux package, reduces boilerplate |
| **Redux Persist** | 6.x | Persists Redux state in localStorage across refreshes |
| **React Router DOM** | 6.x | Client-side routing, SPA navigation |
| **Axios** | 1.x | HTTP client with interceptors for JWT auto-attachment |
| **React DatePicker** | Latest | Calendar date picker for booking selection |
| **date-fns** | 3.x | Utility functions for date difference calculation |
| **React Toastify** | Latest | Toast notification pop-ups |
| **React Icons (fi)** | Latest | Feather icon set |
| **@stripe/react-stripe-js** | Latest | Stripe React components (CardElement) |
| **@stripe/stripe-js** | Latest | Stripe.js browser SDK for payment processing |

### 🔧 Backend
| Technology | Version | Why Used |
|----------|---------|---------|
| **Node.js** | 22.x | JavaScript runtime for server-side code |
| **Express.js** | 4.x | Minimal and flexible Node.js web framework |
| **MongoDB** | 8.x | NoSQL document database for flexible schemas |
| **Mongoose** | 8.x | ODM (Object Document Mapper) for MongoDB |
| **jsonwebtoken (JWT)** | Latest | Creates and verifies authentication tokens |
| **bcryptjs** | Latest | Password hashing with salt rounds |
| **multer** | 1.x | Middleware for handling multipart/form-data (file uploads) |
| **multer-storage-cloudinary** | Latest | Multer storage engine for Cloudinary |
| **cloudinary** | Latest | Cloud image hosting, transformation, CDN |
| **stripe** | Latest | Payment processing SDK |
| **cors** | Latest | Cross-Origin Resource Sharing headers |
| **morgan** | Latest | HTTP request logger for development |
| **express-async-handler** | Latest | Wraps async route handlers to catch errors |
| **dotenv** | Latest | Loads environment variables from `.env` file |
| **nodemon** | Dev | Auto-restarts server on file change |
| **concurrently** | Dev | Runs frontend + backend simultaneously |

### 🗄️ Database
| Service | Purpose |
|---------|---------|
| **MongoDB (Local)** | Development database running on `localhost:27017` |
| **MongoDB Atlas** | Cloud database for production (free 512MB tier) |

---

## 3. Backend — Deep Dive

### Entry Point: `server.js`
```
Express App → Middleware → Routes → Controllers → Models → MongoDB
```
The server:
1. Loads `.env` via `dotenv`
2. Connects to MongoDB via `connectDB()`
3. Applies global middleware (CORS, JSON parser, Morgan, Static files)
4. Mounts 8 route modules under `/api/`
5. Handles 404 and global error middleware at the end

### Controllers (Business Logic Layer)

#### `authController.js`
- **`registerUser`** — Validates input, hashes password with bcrypt (12 rounds), creates User document, returns JWT token
- **`loginUser`** — Finds user by email, compares passwords with `bcrypt.compare()`, returns JWT
- **`getUserProfile`** — Returns current user data (requires JWT)
- **`updateUserProfile`** — Updates name, phone, city, avatar fields

#### `productController.js`
- **`getProducts`** — Full-text search (`$text`), category filter, city regex, price range (`$gte/$lte`), pagination, sort
- **`getProductById`** — Fetches single product with populated owner info
- **`createProduct`** — Vendor creates listing, handles image upload via Multer → Cloudinary
- **`updateProduct`** — Vendor edits own listing (ownership verified)
- **`deleteProduct`** — Vendor/Admin deletes (ownership verified)
- **`getMyProducts`** — Returns all listings for the logged-in vendor
- **`getFeaturedProducts`** — Top 8 by rating + total rentals

#### `bookingController.js`
- **`createBooking`** — Creates booking, checks product availability date conflicts, calculates total (days × price)
- **`createPaymentIntent`** — Creates Stripe PaymentIntent for the booking amount
- **`confirmPayment`** — Updates booking `paymentStatus: paid`, updates product rental count
- **`getMyBookings`** — User's booking history with product + owner populated
- **`getVendorBookings`** — All bookings received for vendor's products
- **`updateBookingStatus`** — Vendor confirms or declines a pending booking
- **`cancelBooking`** — User cancels pending/confirmed booking

#### `reviewController.js`
- **`createReview`** — Posts a review, updates Product's `averageRating` and `numReviews` via MongoDB aggregation
- **`getProductReviews`** — Returns all reviews for a product (sorted newest first)
- **`deleteReview`** — Reviewer or Admin can delete; re-aggregates rating after deletion

#### `wishlistController.js`
- **`toggleWishlist`** — Adds product to `User.wishlist[]` if not present, removes if already there (toggle pattern)
- **`getWishlist`** — Returns user's saved products with full product data populated

#### `adminController.js`
- **`getStats`** — Aggregates: total users, vendors, products, bookings, revenue (paid bookings sum), recent 5 bookings
- **`getAllUsers`** — Lists all users (filtered by role optionally)
- **`updateUser`** — Admin changes role or isActive status
- **`deleteUser`** — Admin deletes user and all their data
- **`getAllBookings`** — All platform bookings with user + product + owner
- **`getAllProducts`** — All listings across all vendors

#### `messageController.js`
- **`sendMessage`** — Validates booking ownership, identifies receiver automatically, saves message
- **`getMessages`** — Returns all messages for booking, marks unread as read
- **`getUnreadCount`** — Returns count of unread messages for notification badge

#### `aiController.js`
- **`chatWithAI`** — Rule-based engine: scans user input for keywords (camera, bike, sofa, etc.), maps to categories, fetches matching products from DB, generates a contextual response with product links
- No external AI API needed — works completely offline

### Middleware

#### `authMiddleware.js`
```javascript
protect       // Verifies JWT from Authorization header, attaches req.user
vendorOnly    // Checks req.user.role === 'vendor' || 'admin'
adminOnly     // Checks req.user.role === 'admin'
```
JWT is extracted: `Authorization: Bearer <token>` → `jwt.verify(token, JWT_SECRET)` → user loaded from DB.

#### `uploadMiddleware.js`
Smart dual-mode upload:
- **With Cloudinary credentials** → Uses `multer-storage-cloudinary` → images stored on CDN with auto-optimization (`1000×700, quality: auto`)
- **Without credentials (development)** → Uses `multer.diskStorage` → images saved to `backend/uploads/` → served statically via Express

#### `errorHandler.js`
- **`notFound`** — 404 handler for unmatched routes
- **`errorHandler`** — Global error handler: extracts status code, returns `{ message, stack }` (stack hidden in production)

---

## 4. Frontend — Deep Dive

### Routing (`App.jsx`)
React Router v6 with nested route protection:
```jsx
<Route path="/vendor" element={
  <PrivateRoute roles={['vendor', 'admin']}>
    <VendorDashboard />
  </PrivateRoute>
} />
```
`PrivateRoute` checks Redux auth state → redirects to `/login` if unauthenticated, or `/` if wrong role.

### Pages

#### `HomePage.jsx`
- Animated hero with gradient text
- Hero search bar that navigates to `/products?keyword=...`
- 4-stat counter section (10K+ renters, 5K+ listings...)
- 8-category grid with emoji icons, each links to `/products?category=...`
- Featured listings fetched from `/api/products/featured`
- "How It Works" 3-step section
- Calls-to-action section with Register/Browse

#### `ProductListPage.jsx`
- Fetches `/api/products` with query params: `keyword, category, sort, minPrice, maxPrice, page, limit`
- URL-synced filters (uses `useSearchParams`)
- Category pill tabs, collapsible filter sidebar
- Sort by: Latest, Price Low→High, Price High→Low, Top Rated
- Pagination with page numbers
- Responsive grid: 1→2→3→4 columns

#### `ProductDetailPage.jsx`
- Image gallery with active thumbnail selection
- Availability badge (green/red)
- Full pricing display (per day + per week)
- Features checklist (green checkmarks)
- Owner card with avatar
- Actions: Book Now, Wishlist toggle (heart), Share (clipboard)
- Reviews section with editable star rating form (logged-in users)
- Reviews list with avatar, name, date, star rating, comment

#### `BookingPage.jsx`
3-step booking flow:
1. **Dates Step** — DatePicker UI with excluded booked date ranges, price breakdown calculator
2. **Payment Step** — Stripe `CardElement` integrated, confirms PaymentIntent
3. **Confirmation** — Success screen with booking summary and navigation

#### `ProfilePage.jsx`
Tab 1: **Profile** — Editable fields (name, phone, city). Email is read-only. Save changes via `PUT /api/auth/profile`.
Tab 2: **Bookings** — My booking history with status badges, "Chat" button (→ `/chat/:bookingId`), "Cancel" button.

#### `VendorDashboard.jsx`
- **Stats row**: Total listings, total bookings, revenue earned
- **Products tab**: All vendor listings with delete button, availability badge
- **Bookings tab**: Received bookings — Confirm / Decline buttons for pending ones
- **Modal form**: New listing creation with all fields + multi-image upload

#### `AdminDashboard.jsx`
- **Overview tab**: 5 stat cards (Renters, Vendors, Listings, Bookings, Revenue), recent bookings list
- **Users tab**: All users with role dropdown (changes role live) + Activate/Deactivate toggle
- **Bookings tab**: All platform bookings with status + payment status badges

#### `ChatPage.jsx`
- Polls `/api/messages/:bookingId` every 5 seconds for new messages
- Message bubbles: right-aligned (me) in blue, left-aligned (them) in slate
- Auto-scroll to latest message on update
- Date separators between messages from different days
- Read receipt indicators (✓ = sent, ✓✓ = read)

### Components

#### `Navbar.jsx`
- Sticky glassmorphism header with blur backdrop
- Shows different nav items based on auth state and role:
  - Guest: Home, Browse, Login, Register
  - User: Home, Browse, Wishlist, Avatar (→ profile), Logout
  - Vendor: + Vendor link
  - Admin: + Admin link
- Mobile hamburger menu

#### `AIChatBot.jsx`
- Floating button (bottom-right) visible when logged in
- Opens a chat window panel
- Sends user message to `POST /api/ai/chat`
- Displays formatted AI response with product links
- Typing animation indicator while waiting

#### `ProductCard.jsx`
- Product image with hover zoom effect
- Category badge, availability badge
- Star rating display
- Location (city) with map pin icon
- Price per day, total rental count
- Wishlist heart toggle button
- Click → navigates to product detail

#### `StarRating.jsx`
Dual-mode component:
- **Read-only**: Renders filled/empty stars based on rating prop
- **Interactive** (editable prop): Hover + click to select rating (used in review form)

---

## 5. Database Design

### User Schema
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: Enum['user', 'vendor', 'admin'] (default: 'user'),
  phone: String,
  city: String,
  avatar: String (URL),
  wishlist: [ObjectId → Product],   // array of saved product IDs
  isActive: Boolean (default: true),
  timestamps: true
}
```
Password is **never stored in plain text**. Before `save()`, bcrypt hashes the password if modified.

### Product Schema
```javascript
{
  title: String (required),
  description: String (required),
  category: Enum['Furniture', 'Electronics', 'Vehicles', 'Garments', 'Tools', 'Sports', 'Books', 'Others'],
  pricePerDay: Number (required),
  pricePerWeek: Number (default: 0),
  images: [String],              // array of image URLs (Cloudinary or local)
  owner: ObjectId → User,
  city: String,
  condition: Enum['New', 'Like New', 'Good', 'Fair'],
  features: [String],            // comma-separated feature list
  isAvailable: Boolean,
  averageRating: Number (0-5),
  numReviews: Number,
  totalRentals: Number,
  bookedDates: [{ startDate, endDate }],  // blocked date ranges
  timestamps: true
}
// Text index on title + description for $text search
```

### Booking Schema
```javascript
{
  user: ObjectId → User,         // renter
  product: ObjectId → Product,
  owner: ObjectId → User,        // vendor
  startDate: Date,
  endDate: Date,
  totalDays: Number,
  totalAmount: Number,           // calculated: days × pricePerDay
  status: Enum['pending', 'confirmed', 'active', 'completed', 'cancelled'],
  paymentStatus: Enum['pending', 'paid', 'refunded'],
  paymentId: String,             // Stripe PaymentIntent ID
  notes: String,
  timestamps: true
}
```

### Review Schema
```javascript
{
  user: ObjectId → User,
  product: ObjectId → Product,
  rating: Number (1-5, required),
  comment: String (required),
  timestamps: true
}
// Unique constraint: one review per user per product
```

### Message Schema
```javascript
{
  booking: ObjectId → Booking,   // chat is tied to a booking
  sender: ObjectId → User,
  receiver: ObjectId → User,
  text: String (required),
  read: Boolean (default: false),
  timestamps: true
}
```

---

## 6. Authentication System

### How JWT Works in INSTARENTAL

```
1. User submits login form
      ↓
2. Backend verifies email + bcrypt.compare(password, hash)
      ↓
3. Backend generates: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' })
      ↓
4. Token returned to frontend → stored in Redux (persisted to localStorage)
      ↓
5. Every subsequent API call:
   Axios interceptor adds: Authorization: Bearer <token>
      ↓
6. Backend authMiddleware:
   jwt.verify(token, JWT_SECRET) → decodes userId → User.findById(id) → req.user
      ↓
7. Route handler accesses req.user for authenticated operations
```

### Axios Interceptor (`api/axiosConfig.js`)
```javascript
axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
This means you **never manually attach the token** — it's automatic on every request.

### Redux Persist
Auth state (user + token) is saved to `localStorage` via `redux-persist`. On page refresh, the state is **rehydrated** — user stays logged in without needing to re-authenticate.

---

## 7. File Upload System

### Development (No Cloudinary Keys)
```
Browser selects file
      ↓
FormData (multipart/form-data)
      ↓
Multer diskStorage → saved to backend/uploads/TIMESTAMP-RANDOM.jpg
      ↓
Express static middleware serves: GET /uploads/filename.jpg
      ↓
Image URL stored as: "/uploads/filename.jpg"
      ↓
Frontend: <img src="http://localhost:5000/uploads/filename.jpg" />
```

### Production (With Cloudinary Keys)
```
Browser selects file
      ↓
multer-storage-cloudinary
      ↓
Uploaded to Cloudinary CDN (folder: instarental/)
Auto-transformed: 1000×700, quality: auto, format: auto
      ↓
Cloudinary returns secure HTTPS URL
      ↓
URL stored in MongoDB
      ↓
Frontend: <img src="https://res.cloudinary.com/your-name/..." />
```

---

## 8. Payment Integration

### Stripe Flow (3-Step Booking)

**Step 1 — Frontend selects dates, clicks "Continue to Payment":**
```
Frontend → POST /api/bookings → Booking created with status: 'pending'
```

**Step 2 — Stripe PaymentIntent:**
```
Frontend → POST /api/bookings/payment-intent { bookingId }
      ↓
Backend → stripe.paymentIntents.create({ amount: totalAmount * 100, currency: 'inr' })
      ↓
Returns clientSecret to frontend
      ↓
Frontend → stripe.confirmCardPayment(clientSecret, { payment_method: { card: CardElement } })
      ↓
Stripe processes payment
```

**Step 3 — Confirm:**
```
Frontend → PUT /api/bookings/:id/pay { paymentId }
      ↓
Backend → Booking.paymentStatus = 'paid', Booking.status = 'confirmed'
         Product.totalRentals += 1
         Product.bookedDates.push({ startDate, endDate })
      ↓
Frontend shows success screen
```

### Without Stripe Key
The booking is created directly (`status: pending`) and the payment step is skipped. A notice is shown in the UI. This lets you test the full flow without a Stripe account.

---

## 9. AI Assistant

### How InstaBot Works
The AI assistant is **entirely custom, no external API**. It uses a keyword-matching rule engine:

```javascript
// User says: "I need a camera for my trip next week"
//
// Step 1: Keyword detection
keywords = ['camera'] → detected category: 'Electronics'
//
// Step 2: DB query  
products = await Product.find({ category: 'Electronics', isAvailable: true }).limit(3)
//
// Step 3: Template response
"📸 Great choice! I found 3 Electronics items for you:
 • Sony Alpha A7 IV Camera — ₹1200/day [View →]
 • MacBook Pro M3 — ₹800/day [View →]"
```

### Supported Keyword Categories
| Keywords | Suggested Category |
|----------|-------------------|
| sofa, chair, table, bed, furniture | Furniture |
| laptop, camera, phone, drone, projector | Electronics |
| bike, car, scooter, vehicle | Vehicles |
| dress, suit, lehenga, sherwani | Garments |
| drill, wrench, tool, equipment | Tools |
| tent, cricket, football, sports | Sports |

---

## 10. Real-Time Chat

### Architecture
INSTARENTAL uses **polling** (not WebSockets) for simplicity:

```
ChatPage mounts
      ↓
setInterval(loadMessages, 5000)   ← polls every 5 seconds
      ↓
GET /api/messages/:bookingId
      ↓
Backend marks unread messages as read (read: true)
      ↓
React re-renders with new messages
      ↓
Auto-scrolls to bottom via ref
```

### Message Permissions
Only the **renter** (booking.user) and **owner** (booking.owner) can read and write in a booking's chat thread. Admin can also access for moderation.

---

## 11. State Management

### Redux Store Structure
```
store/
├── auth: { user, token, loading, error }
├── products: { products, selectedProduct, myProducts, loading, error, page, pages, total }
├── bookings: { myBookings, vendorBookings, loading, error }
└── wishlist: { items, loading }
```

### Redux Persist Configuration
```javascript
persistConfig = {
  key: 'root',
  storage: localStorage,
  whitelist: ['auth', 'wishlist']   // only these slices are persisted
}
```
Products and bookings are NOT persisted (always fetched fresh). Auth and wishlist ARE persisted (survive refresh).

### Data Flow Example (Book a product)
```
User clicks "Confirm Booking"
      ↓
dispatch(createBooking({ productId, startDate, endDate, notes }))
      ↓
bookingSlice → axios.post('/api/bookings', data)
      ↓
Backend creates Booking document, returns booking
      ↓
Redux state: { bookings: [..., newBooking] }
      ↓
Component reacts: setStep(2) → shows payment form
      ↓
After payment: setStep(3) → shows success screen
```

---

## 12. API Architecture

### REST Conventions
```
GET    /api/products          → List all (with filters)
POST   /api/products          → Create (Vendor)
GET    /api/products/:id      → Get one
PUT    /api/products/:id      → Update (Vendor/Admin)
DELETE /api/products/:id      → Delete (Vendor/Admin)
```

### Error Response Format
All errors follow:
```json
{
  "message": "Human-readable error message",
  "stack": "...only in development mode..."
}
```

### Success Response Format
Varies by endpoint:
- List: `{ products: [...], page: 1, pages: 5, total: 60 }`
- Single: `{ _id, title, ... }`
- Auth: `{ _id, name, email, role, token }`
- Action: `{ message: "Success text" }`

---

## 13. Security Practices

| Practice | Implementation |
|----------|---------------|
| **Password Hashing** | bcryptjs with 12 salt rounds |
| **JWT Expiry** | 30 days (configurable via `JWT_EXPIRES_IN`) |
| **Route Protection** | `protect`, `vendorOnly`, `adminOnly` middleware |
| **Frontend Route Guards** | `PrivateRoute` component blocks unauthorized page access |
| **CORS** | Only `localhost:5173` and `localhost:3000` allowed in development |
| **Env Variables** | All secrets in `.env`, never committed to Git |
| **`.gitignore`** | `node_modules`, `.env`, `uploads/`, `dist/` all ignored |
| **Error Masking** | Stack traces hidden in production |
| **Input Validation** | `express-async-handler` + Mongoose schema validation |
| **Role Verification** | Both frontend (route guard) AND backend (middleware) check roles |

---

## 14. Folder Structure Explained

```
instaRental-app/
│
├── 📄 README.md                    ← Project overview & quick start
├── 📄 TECH_DETAILS.md              ← This file — detailed documentation
├── 📄 SETUP_GUIDE.md               ← Step-by-step local setup
├── 📄 package.json                 ← Root: concurrently scripts
├── 📄 .gitignore                   ← Ignores node_modules, .env, dist
│
├── 📂 backend/
│   ├── 📄 server.js                ← Express app, middleware, routes mount
│   ├── 📄 package.json             ← Backend dependencies
│   ├── 📄 .env                     ← Secret environment variables
│   ├── 📄 seed.js                  ← Database seeder (18 products + users)
│   │
│   ├── 📂 config/
│   │   └── db.js                   ← MongoDB connection via Mongoose
│   │
│   ├── 📂 models/                  ← Mongoose schemas
│   │   ├── User.js                 ← User with roles, wishlist, bcrypt hook
│   │   ├── Product.js              ← Rental items, bookedDates, text index
│   │   ├── Booking.js              ← Bookings with payment tracking
│   │   ├── Review.js               ← Reviews linked to product + user
│   │   └── Message.js              ← Chat messages per booking
│   │
│   ├── 📂 controllers/             ← Business logic (all async)
│   │   ├── authController.js       ← Register, login, profile
│   │   ├── productController.js    ← CRUD, search, featured
│   │   ├── bookingController.js    ← Booking lifecycle + Stripe
│   │   ├── reviewController.js     ← Reviews + rating aggregation
│   │   ├── wishlistController.js   ← Toggle + fetch wishlist
│   │   ├── adminController.js      ← Platform stats + user management
│   │   ├── messageController.js    ← Chat messages
│   │   └── aiController.js         ← Rule-based AI suggestion engine
│   │
│   ├── 📂 middleware/
│   │   ├── authMiddleware.js       ← JWT verify, role guards
│   │   ├── errorHandler.js         ← 404 + global error handler
│   │   └── uploadMiddleware.js     ← Multer + Cloudinary/disk dual mode
│   │
│   ├── 📂 routes/                  ← Express Router modules
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── messageRoutes.js
│   │   └── aiRoutes.js
│   │
│   ├── 📂 utils/
│   │   └── generateToken.js        ← jwt.sign() helper
│   │
│   └── 📂 uploads/                 ← Local image storage (dev only, gitignored)
│
└── 📂 frontend/
    ├── 📄 index.html               ← HTML entry point
    ├── 📄 vite.config.js           ← Vite + proxy to backend :5000
    ├── 📄 tailwind.config.js       ← Tailwind CSS config + custom colors
    ├── 📄 .env                     ← VITE_STRIPE_PUBLIC_KEY
    │
    └── 📂 src/
        ├── 📄 main.jsx             ← React root render + Redux Provider
        ├── 📄 App.jsx              ← Route definitions + PrivateRoute guard
        ├── 📄 index.css            ← Global styles, custom utility classes
        │
        ├── 📂 api/
        │   └── axiosConfig.js      ← Axios instance with JWT interceptor
        │
        ├── 📂 store/
        │   └── store.js            ← Redux Toolkit store + redux-persist
        │
        ├── 📂 features/            ← Redux slices (state + async thunks)
        │   ├── auth/authSlice.js
        │   ├── products/productSlice.js
        │   ├── bookings/bookingSlice.js
        │   └── wishlist/wishlistSlice.js
        │
        ├── 📂 components/          ← Reusable UI components
        │   ├── Navbar.jsx          ← Sticky nav, role-aware links
        │   ├── Footer.jsx          ← Site links + social
        │   ├── ProductCard.jsx     ← Card with wishlist toggle
        │   ├── StarRating.jsx      ← Read-only + interactive mode
        │   ├── Loader.jsx          ← Animated spinner overlay
        │   └── AIChatBot.jsx       ← Floating chat widget
        │
        └── 📂 pages/               ← Full page components
            ├── HomePage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── ProductListPage.jsx
            ├── ProductDetailPage.jsx
            ├── BookingPage.jsx
            ├── ProfilePage.jsx
            ├── WishlistPage.jsx
            ├── ChatPage.jsx
            ├── VendorDashboard.jsx
            ├── AdminDashboard.jsx
            └── NotFoundPage.jsx
```

---

*Last Updated: April 2026 | INSTARENTAL v1.0*
