# API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
Include JWT token in header:
Authorization: Bearer <token>

## Endpoints

### Auth Routes
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user
- GET `/auth/me` - Get current user

### User Routes
- GET `/users` - Get all users (Admin only)
- GET `/users/:id` - Get user by ID
- PUT `/users/:id` - Update user
- DELETE `/users/:id` - Delete user

(More routes to be documented...)
