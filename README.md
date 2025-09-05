# 🍕 Food Delivery App

A full-stack food delivery application built with React, Node.js, Express, and PostgreSQL.

## 👥 Team
- **Shubhangam Singh** - Full-stack development
- **Jimit Patel** - Full-stack development

## 🚀 Tech Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Axios for API calls
- CSS3 for styling

### Backend
- Node.js with Express.js
- PostgreSQL database
- Prisma ORM
- JWT authentication
- bcryptjs for password hashing

## 📋 Features

- 🔐 User authentication (Customer, Restaurant Owner, Admin)
- 🏪 Restaurant management
- 📱 Menu management
- 🛒 Order processing
- 🚚 Delivery tracking
- ⭐ Reviews and ratings
- 💳 Payment integration (planned)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Git

### Installation

1. Clone the repository
git clone https://github.com/Shubhangam-Singh/food-delivery-app.git
cd food-delivery-app

2. Set up the server
cd server
npm install
cp .env.example .env # Configure your database URL
npx prisma migrate dev
npm run seed

3. Set up the client
cd ../client
npm install

4. Run the application
Terminal 1 - Server
cd server
npm run dev

Terminal 2 - Client
cd client
npm run dev

## 📱 Usage

- **Server**: http://localhost:5000
- **Client**: http://localhost:5173

### Test Accounts
- Admin: admin@fooddelivery.com / password123
- Restaurant Owner: owner@tastybites.com / password123
- Customer: john.doe@email.com / password123

## 🗄️ Database Schema

- Users (customers, restaurant owners, admins)
- Restaurants with addresses and menus
- Orders with items and delivery tracking
- Reviews and ratings

## 🔧 Development

### Available Scripts

#### Server
- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm run seed` - Seed database

#### Client
- `npm run dev` - Start development client
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push branch: `git push origin feature/your-feature`
4. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details
