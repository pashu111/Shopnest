<<<<<<< HEAD
# 🛍️ ShopNest

ShopNest is a full-stack e-commerce web application that provides a modern online shopping experience. It includes secure authentication, product management, shopping cart, order processing, and role-based access for administrators and customers.

## 🚀 Features

### 👤 User
- User Registration & Login
- JWT Authentication
- Browse Products
- Search & Filter Products
- Product Details Page
- Shopping Cart
- Wishlist
- Secure Checkout
- Order History
- User Profile Management

### 🛠️ Admin
- Secure Admin Dashboard
- Add, Update & Delete Products
- Manage Categories
- Manage Users
- Manage Orders
- Dashboard Analytics

## 🏗️ Tech Stack

### Frontend
- React.js
- React Router
- Tailwind CSS
- Axios
- Redux Toolkit

### Backend
- Node.js
- Express.js
- JWT Authentication
- REST API

### Database
- MongoDB
- Mongoose

## 📂 Project Structure

```
ShopNest/
│
├── client/          # React Frontend
├── server/          # Express Backend
├── README.md
└── package.json
```

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/your-username/shopnest.git
cd shopnest
```

### Install Frontend

```bash
cd client
npm install
npm run dev
```

### Install Backend

```bash
cd server
npm install
npm start
```

## 🔑 Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
```

## 📸 Screenshots

Add screenshots of:

- Home Page
- Product Listing
- Product Details
- Cart
- Checkout
- User Dashboard
- Admin Dashboard

## 🌐 Deployment

Frontend:
- Vercel

Backend:
- Render

Database:
- MongoDB Atlas

## 📌 API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`

### Products
- GET `/api/products`
- GET `/api/products/:id`

### Cart
- GET `/api/cart`
- POST `/api/cart`

### Orders
- POST `/api/orders`
- GET `/api/orders`

## 🔒 Authentication

- JWT Token Authentication
- Protected Routes
- Role-Based Authorization (Admin/User)

## 📈 Future Improvements

- Online Payments (Stripe/Razorpay)
- Product Reviews & Ratings
- Coupons & Discounts
- Email Notifications
- Inventory Management
- Product Recommendations

## 🤝 Contributing

Contributions are welcome. Feel free to fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ashutosh Pradhan**

- GitHub: https://github.com/your-username
- LinkedIn: https://linkedin.com/in/your-profile
=======
# Shopnest
>>>>>>> a89c02330dca5a9f97216241bf3093632c1e1f49
