# 🛒 DailoXpress

**DailoXpress** is a full-stack grocery delivery platform built with **Next.js 16**, **MongoDB**, and **Socket.IO**. It supports three distinct user roles — **Customer**, **Delivery Boy**, and **Admin** — each with a tailored dashboard, real-time order tracking, and live in-app chat.

🔗 **Live Demo:** [https://dailo-xpress.vercel.app/](https://dailo-xpress.vercel.app/)

---

## ✨ Features

### 👤 Customer
- Browse and search paginated grocery listings by name or category
- View product details with images, descriptions, ratings, and reviews
- Add items to cart and checkout with delivery address via interactive map (Leaflet)
- Pay via **Cash on Delivery** or **eSewa** (online payment)
- Track order status in real time with live delivery boy location on map
- Chat with delivery boy via real-time messaging
- Confirm delivery with a secure **OTP verification** flow

### 🛵 Delivery Boy
- View assigned delivery orders on a dashboard with earnings charts (Recharts)
- Real-time location broadcasting via Socket.IO
- Accept/reject orders and update delivery status
- Chat with customers per order

### 🔐 Admin
- Full CRUD for grocery inventory (image upload via Cloudinary)
- Manage all orders and assign delivery personnel
- Notify delivery boys via Socket.IO events
- View platform-wide order and user activity

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | MongoDB (Mongoose) |
| **Authentication** | NextAuth v5 (Credentials + Google OAuth) |
| **Real-time** | Socket.IO (standalone Express server) |
| **Styling** | Tailwind CSS v4 |
| **Maps** | Leaflet + React Leaflet + Leaflet GeoSearch |
| **Charts** | Recharts |
| **File Storage** | Cloudinary |
| **Payment** | eSewa (sandbox + production ready) |
| **Security** | Arcjet (bot protection, WAF, rate limiting) |
| **Form Validation** | Formik + Yup + Zod |
| **Email** | Nodemailer |
| **State Management** | Redux Toolkit |
| **Animations** | Motion (Framer Motion) |
| **Icons** | Lucide React + React Icons |

---

## 📁 Project Structure

```
dailoxpress/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin pages
│   │   ├── grocery/            # Product detail pages
│   │   ├── user/               # User order pages
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── unauthorized/       # 403 page
│   │   └── api/
│   │       ├── admin/          # Admin REST endpoints
│   │       ├── auth/           # NextAuth handlers
│   │       ├── chat/           # Chat save endpoint
│   │       ├── delivery/       # Delivery boy endpoints
│   │       ├── grocery/        # Grocery CRUD endpoints
│   │       ├── me/             # Authenticated user profile
│   │       ├── socket/         # Socket identity & location sync
│   │       └── user/           # User order endpoints
│   ├── components/             # Reusable UI components
│   ├── models/                 # Mongoose schemas
│   │   ├── user.model.ts
│   │   ├── grocery.model.ts
│   │   ├── order.model.ts
│   │   ├── deliveryAssignment.model.ts
│   │   └── message.model.ts
│   ├── lib/                    # DB connection, utilities
│   ├── redux/                  # Redux store & slices
│   ├── hooks/                  # Custom React hooks
│   ├── providers/              # Context & session providers
│   ├── auth.ts                 # NextAuth configuration
│   └── proxy.ts                # Centralized API proxy
└── socketServer/               # Standalone Socket.IO server (Express)
    └── index.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** Atlas cluster (or local instance)
- **Cloudinary** account
- **Google Cloud** OAuth 2.0 credentials
- **eSewa** merchant account (sandbox for testing)
- **Arcjet** account for security middleware

### 1. Clone the repository

```bash
git clone https://github.com/Birendra16/DailoXpress.git
cd dailoxpress
```

### 2. Install dependencies

```bash
# Next.js app
npm install

# Socket.IO server
cd socketServer
npm install
cd ..
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URL="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/DailoXpress"

# NextAuth
AUTH_SECRET="your-random-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# eSewa Payment (use sandbox values for development)
ESEWA_PRODUCT_CODE="esewa_product_code"
ESEWA_SECRET_KEY="esewa_secret_key"
ESEWA_PAYMENT_URL="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
ESEWA_STATUS_URL="https://rc.esewa.com.np/api/epay/transaction/status"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_SERVER="http://localhost:8000"

# Gemini AI (for smart suggestions)
GEMINI_API_KEY="your-gemini-api-key"

# Email (Nodemailer)
EMAIL="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Arcjet Security
ARCJET_KEY="your-arcjet-key"
```

Create a `.env` file inside the `socketServer/` directory:

```env
PORT=8000
CLIENT_URL=http://localhost:3000
```

### 4. Run the development servers

Open two separate terminals:

```bash
# Terminal 1 — Next.js app
npm run dev

# Terminal 2 — Socket.IO server
cd socketServer
node index.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 User Roles

| Role | Access |
|---|---|
| `user` | Browse groceries, place orders, track delivery, chat |
| `deliveryBoy` | View assigned orders, update location, OTP delivery |
| `admin` | Manage inventory, assign deliveries, manage all orders |

> On first login, users are prompted to complete their profile (mobile number + role selection) before accessing the platform.

---

## 🔒 Security

- **Arcjet** middleware enforces bot protection, WAF rules, and rate limiting on all sensitive routes (registration, ordering, AI endpoints)
- **NextAuth v5** with JWT strategy (10-day session lifespan)
- **Zod** schema validation on auth inputs server-side
- **Formik + Yup** for client-side form validation
- **bcryptjs** for password hashing
- Server-side user identity verification on all protected API routes to prevent IDOR

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<p align="center">Built with ❤️ by <strong>Birendra Bohara</strong></p>
