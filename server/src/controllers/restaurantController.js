const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const restaurantController = {
  // GET all restaurants with advanced filtering and search
  getAllRestaurants: async (req, res) => {
    try {
      const {
        search = '',
        cuisine = '',
        minRating = 0,
        maxDeliveryFee = 1000,
        sortBy = 'rating',
        sortOrder = 'desc',
        page = 1,
        limit = 12
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build dynamic where clause
      const whereClause = {
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { cuisineType: { hasSome: [search] } }
          ]
        }),
        ...(cuisine && {
          cuisineType: { has: cuisine }
        }),
        rating: { gte: parseFloat(minRating) },
        deliveryFee: { lte: parseFloat(maxDeliveryFee) }
      };

      // Build dynamic order clause
      const orderBy = {};
      if (sortBy === 'rating') {
        orderBy.rating = sortOrder;
      } else if (sortBy === 'deliveryFee') {
        orderBy.deliveryFee = sortOrder;
      } else if (sortBy === 'name') {
        orderBy.name = sortOrder;
      } else {
        orderBy.createdAt = 'desc';
      }

      // Get restaurants with all related data
      const restaurants = await prisma.restaurant.findMany({
        where: whereClause,
        include: {
          address: true,
          owner: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          menuItems: {
            select: {
              id: true,
              name: true,
              price: true,
              category: true,
              isAvailable: true
            },
            where: { isAvailable: true },
            take: 5
          },
          reviews: {
            select: {
              rating: true,
              comment: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            },
            take: 3,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              reviews: true,
              orders: true,
              menuItems: true
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      });

      // Get total count for pagination
      const totalCount = await prisma.restaurant.count({
        where: whereClause
      });

      // Calculate additional fields
      const restaurantsWithExtras = restaurants.map(restaurant => ({
        ...restaurant,
        averagePrice: restaurant.menuItems.length > 0 
          ? Math.round(restaurant.menuItems.reduce((sum, item) => sum + item.price, 0) / restaurant.menuItems.length)
          : 0,
        totalReviews: restaurant._count.reviews,
        totalOrders: restaurant._count.orders,
        menuItemsCount: restaurant._count.menuItems,
        isOpen: isRestaurantOpen(restaurant.openTime, restaurant.closeTime)
      }));

      res.json({
        success: true,
        data: {
          restaurants: restaurantsWithExtras,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount,
            hasNext: skip + parseInt(limit) < totalCount,
            hasPrev: parseInt(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Get restaurants error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET single restaurant with full details - ✅ FIXED ORDERBY
  getRestaurantById: async (req, res) => {
    try {
      const { id } = req.params;

      const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: {
          address: true,
          owner: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          menuItems: {
            where: { isAvailable: true },
            orderBy: { category: { name: 'asc' } } // ✅ FIXED: Sort by category name
          },
          reviews: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          _count: {
            select: {
              reviews: true,
              orders: true,
              menuItems: true
            }
          }
        }
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          error: 'Restaurant not found'
        });
      }

      // Group menu items by category
      const menuByCategory = restaurant.menuItems.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});

      // Calculate rating distribution
      const ratingDistribution = restaurant.reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {});

      const restaurantWithExtras = {
        ...restaurant,
        menuByCategory,
        ratingDistribution,
        totalReviews: restaurant._count.reviews,
        totalOrders: restaurant._count.orders,
        isOpen: isRestaurantOpen(restaurant.openTime, restaurant.closeTime),
        averagePrice: restaurant.menuItems.length > 0 
          ? Math.round(restaurant.menuItems.reduce((sum, item) => sum + item.price, 0) / restaurant.menuItems.length)
          : 0
      };

      res.json({
        success: true,
        data: restaurantWithExtras
      });
    } catch (error) {
      console.error('Get restaurant error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET restaurant menu with categories - ✅ FIXED ORDERBY
  getRestaurantMenu: async (req, res) => {
    try {
      const { id } = req.params;
      const { category } = req.query;

      const whereClause = {
        restaurantId: id,
        isAvailable: true,
        ...(category && { category })
      };

      const menuItems = await prisma.menuItem.findMany({
        where: whereClause,
        orderBy: [
          { category: { name: 'asc' } }, // ✅ FIXED: Sort by category name
          { name: 'asc' }
        ]
      });

      // Get all available categories for this restaurant
      const categories = await prisma.menuItem.findMany({
        where: {
          restaurantId: id,
          isAvailable: true
        },
        select: { category: true },
        distinct: ['category']
      });

      const menuByCategory = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          menuItems,
          menuByCategory,
          categories: categories.map(c => c.category)
        }
      });
    } catch (error) {
      console.error('Get menu error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET restaurant search suggestions
  getSearchSuggestions: async (req, res) => {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return res.json({
          success: true,
          data: { suggestions: [] }
        });
      }

      // Get restaurant name suggestions
      const restaurantSuggestions = await prisma.restaurant.findMany({
        where: {
          isActive: true,
          name: {
            contains: q,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          cuisineType: true
        },
        take: 5
      });

      // Get cuisine suggestions
      const cuisineSuggestions = await prisma.restaurant.findMany({
        where: {
          isActive: true,
          cuisineType: {
            hasSome: [q]
          }
        },
        select: {
          cuisineType: true
        },
        take: 5
      });

      const uniqueCuisines = [...new Set(
        cuisineSuggestions.flatMap(r => r.cuisineType)
          .filter(cuisine => cuisine.toLowerCase().includes(q.toLowerCase()))
      )];

      res.json({
        success: true,
        data: {
          suggestions: {
            restaurants: restaurantSuggestions.map(r => ({
              type: 'restaurant',
              id: r.id,
              name: r.name,
              subtitle: r.cuisineType.join(', ')
            })),
            cuisines: uniqueCuisines.map(cuisine => ({
              type: 'cuisine',
              name: cuisine,
              subtitle: 'Cuisine type'
            }))
          }
        }
      });
    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // CREATE new restaurant
  createRestaurant: async (req, res) => {
    try {
      const { name, description, phone, email, address, cuisineType, openTime, closeTime } = req.body;

      if (!name || !phone || !email || !address) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const createdAddress = await prisma.address.create({
        data: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          landmark: address.landmark || null,
          latitude: address.latitude || null,
          longitude: address.longitude || null
        }
      });

      const restaurant = await prisma.restaurant.create({
        data: {
          name,
          description: description || '',
          phone,
          email,
          ownerId: req.user.id,
          addressId: createdAddress.id,
          cuisineType: cuisineType || [],
          openTime: openTime || '09:00',
          closeTime: closeTime || '22:00'
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
        message: 'Restaurant created successfully',
        data: restaurant
      });
    } catch (error) {
      console.error('Create restaurant error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create restaurant'
      });
    }
  },

  // UPDATE restaurant
  updateRestaurant: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingRestaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: { owner: true }
      });

      if (!existingRestaurant) {
        return res.status(404).json({
          success: false,
          error: 'Restaurant not found'
        });
      }

      if (req.user.role !== 'ADMIN' && existingRestaurant.ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own restaurant'
        });
      }

      const { ownerId, address, ...restaurantData } = updateData;

      const updatedRestaurant = await prisma.restaurant.update({
        where: { id },
        data: restaurantData,
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

      res.json({
        success: true,
        message: 'Restaurant updated successfully',
        data: updatedRestaurant
      });
    } catch (error) {
      console.error('Update restaurant error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update restaurant'
      });
    }
  },

  // DELETE restaurant
  deleteRestaurant: async (req, res) => {
    try {
      const { id } = req.params;

      const existingRestaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: { owner: true }
      });

      if (!existingRestaurant) {
        return res.status(404).json({
          success: false,
          error: 'Restaurant not found'
        });
      }

      if (req.user.role !== 'ADMIN' && existingRestaurant.ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own restaurant'
        });
      }

      await prisma.restaurant.update({
        where: { id },
        data: { isActive: false }
      });

      res.json({
        success: true,
        message: 'Restaurant deleted successfully'
      });
    } catch (error) {
      console.error('Delete restaurant error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete restaurant'
      });
    }
  }
};

// Helper function to check if restaurant is open
function isRestaurantOpen(openTime, closeTime) {
  if (!openTime || !closeTime) return true;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  
  return currentTime >= openMinutes && currentTime <= closeMinutes;
}

module.exports = restaurantController;
