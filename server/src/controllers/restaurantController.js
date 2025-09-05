// server/src/controllers/restaurantController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const restaurantController = {
  // GET all restaurants
  getAllRestaurants: async (req, res) => {
    try {
      const restaurants = await prisma.restaurant.findMany({
        include: {
          address: true,
          _count: {
            select: {
              reviews: true,
              orders: true
            }
          }
        },
        where: {
          isActive: true
        }
      });
      
      res.json({
        success: true,
        data: restaurants
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // POST create restaurant
  createRestaurant: async (req, res) => {
    try {
      const { name, description, phone, email, address, ownerId } = req.body;
      
      const restaurant = await prisma.restaurant.create({
        data: {
          name,
          description,
          phone,
          email,
          ownerId,
          address: {
            create: address
          }
        },
        include: {
          address: true,
          owner: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // PUT update restaurant
  updateRestaurant: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const restaurant = await prisma.restaurant.update({
        where: { id },
        data: updateData,
        include: {
          address: true
        }
      });

      res.json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // DELETE restaurant
  deleteRestaurant: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.restaurant.update({
        where: { id },
        data: { isActive: false }
      });

      res.json({
        success: true,
        message: 'Restaurant deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = restaurantController;
