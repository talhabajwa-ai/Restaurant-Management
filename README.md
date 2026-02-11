# Restaurant Management System (RMS)

A full-stack Restaurant Management System built with React.js, Node.js, Express.js, and MongoDB.

## Tech Stack

### Frontend
- React.js (Functional Components & Hooks)
- React Router DOM
- Tailwind CSS
- Chart.js for analytics
- Axios for API calls
- React Hot Toast for notifications
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

## Features

### Authentication & Authorization
- Login/Register with JWT
- Role-based access control (Admin, Manager, Waiter, Cashier)
- Protected routes

### Dashboard
- Overview cards (Total Orders, Revenue, Tables, Staff)
- Weekly sales chart
- Order status distribution
- Recent orders list
- Popular items

### Menu Management
- Add/Edit/Delete menu items
- Categories (Fast Food, Drinks, Desserts, etc.)
- Price, availability status
- Search and filter functionality

### Table Management
- Add/Edit/Delete tables
- Table status (Available, Reserved, Occupied, Cleaning)
- Location tracking (Indoor, Outdoor, Balcony, Private Room)
- Real-time status updates

### Order Management
- Create new orders
- Add items to cart
- Automatic total calculation
- Update order status (Pending → Preparing → Ready → Served → Completed)
- Order tracking

### Billing System
- Generate invoices
- Print bills
- Payment processing (Cash, Card)
- Payment status tracking

### Staff Management
- Add/Edit/Delete staff
- Assign roles
- Department management
- Performance tracking
- Shift management

### Reports & Analytics
- Daily/Monthly sales reports
- Top selling items
- Revenue by category
- Order status statistics
- Export to CSV

## User Roles

1. **Admin**: Full access to all features
2. **Manager**: Access to Dashboard, Menu, Tables, Orders, Billing, Staff, Reports
3. **Waiter**: Access to Dashboard, Menu, Tables, Orders
4. **Cashier**: Access to Dashboard, Billing

## Project Structure

```
restaurant-management/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── tableController.js
│   │   ├── orderController.js
│   │   ├── staffController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── MenuItem.js
│   │   ├── Table.js
│   │   ├── Order.js
│   │   └── Staff.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── tables.js
│   │   ├── orders.js
│   │   ├── staff.js
│   │   └── reports.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Sidebar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   ├── dashboard/
    │   │   │   └── Dashboard.jsx
    │   │   ├── menu/
    │   │   │   └── Menu.jsx
       │   ├── tables/
    │   │   │   └── Tables.jsx
    │   │   ├── orders/
    │   │   │   └── Orders.jsx
    │   │   ├── billing/
    │   │   │   └── Billing.jsx
    │   │   ├── staff/
    │   │   │   └── Staff.jsx
    │   │   └── reports/
    │   │       └── Reports.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .env
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant_management
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## Default Login Credentials

- **Admin**: admin@rms.com / admin123
- **Manager**: manager@rms.com / manager123

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Menu
- GET `/api/menu` - Get all menu items
- GET `/api/menu/:id` - Get single menu item
- POST `/api/menu` - Create menu item
- PUT `/api/menu/:id` - Update menu item
- DELETE `/api/menu/:id` - Delete menu item
- GET `/api/menu/categories` - Get all categories

### Tables
- GET `/api/tables` - Get all tables
- GET `/api/tables/:id` - Get single table
- POST `/api/tables` - Create table
- PUT `/api/tables/:id` - Update table
- DELETE `/api/tables/:id` - Delete table
- PATCH `/api/tables/:id/status` - Update table status

### Orders
- GET `/api/orders` - Get all orders
- GET `/api/orders/:id` - Get single order
- POST `/api/orders` - Create order
- PUT `/api/orders/:id` - Update order
- PATCH `/api/orders/:id/status` - Update order status
- PATCH `/api/orders/:id/payment` - Process payment
- DELETE `/api/orders/:id` - Delete order

### Staff
- GET `/api/staff` - Get all staff
- GET `/api/staff/:id` - Get single staff
- POST `/api/staff` - Create staff
- PUT `/api/staff/:id` - Update staff
- DELETE `/api/staff/:id` - Delete staff
- POST `/api/staff/:id/performance` - Add performance review

### Reports
- GET `/api/reports/dashboard` - Get dashboard stats
- GET `/api/reports/sales` - Get sales report
- GET `/api/reports/top-items` - Get top selling items
- GET `/api/reports/order-status` - Get order status stats
- GET `/api/reports/revenue-by-category` - Get revenue by category

## UI Features

- Dark modern theme
- Responsive design
- Sidebar navigation
- Clean dashboard layout
- Interactive charts
- Toast notifications
- Modal dialogs
- Print-friendly bills

## License

MIT License