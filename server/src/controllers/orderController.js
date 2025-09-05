const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const orderController = {
  // CREATE new order with complex transaction handling
  createOrder: async (req, res) => {
    try {
      const { cartItems, restaurantId, deliveryAddressId, deliveryInstructions, paymentMethod } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!cartItems || !restaurantId || !deliveryAddressId || cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: cartItems, restaurantId, deliveryAddressId'
        });
      }

      // Use Prisma transaction for data consistency
      const result = await prisma.$transaction(async (prisma) => {
        // 1. Verify restaurant exists and is active
        const restaurant = await prisma.restaurant.findUnique({
          where: { id: restaurantId },
          include: { address: true }
        });

        if (!restaurant || !restaurant.isActive) {
          throw new Error('Restaurant not found or inactive');
        }

        // 2. Verify delivery address belongs to user
        const deliveryAddress = await prisma.address.findUnique({
          where: { id: deliveryAddressId },
        });

        if (!deliveryAddress || deliveryAddress.userId !== userId) {
          throw new Error('Invalid delivery address');
        }

        // 3. Verify all menu items exist and calculate totals
        let subtotal = 0;
        const validatedItems = [];

        for (const item of cartItems) {
          const menuItem = await prisma.menuItem.findUnique({
            where: { id: item.id }
          });

          if (!menuItem || !menuItem.isAvailable || menuItem.restaurantId !== restaurantId) {
            throw new Error(`Menu item ${item.name} is not available`);
          }

          const itemTotal = menuItem.price * item.quantity;
          subtotal += itemTotal;

          validatedItems.push({
            menuItemId: menuItem.id,
            quantity: item.quantity,
            price: menuItem.price, // Store price at time of order
            notes: item.specialInstructions || null
          });

          // Update menu item order count (business intelligence)
          await prisma.menuItem.update({
            where: { id: menuItem.id },
            data: { timesOrdered: { increment: item.quantity } }
          });
        }

        // 4. Calculate fees and totals
        const deliveryFee = restaurant.deliveryFee || 0;
        const tax = subtotal * 0.05; // 5% tax
        const totalAmount = subtotal + deliveryFee + tax;

        // 5. Generate unique order number
        const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        // 6. Create the order
        const order = await prisma.order.create({
          data: {
            orderNumber,
            customerId: userId,
            restaurantId,
            addressId: deliveryAddressId,
            status: 'PENDING',
            totalAmount,
            deliveryFee,
            tax,
            discount: 0,
            instructions: deliveryInstructions || null,
            paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
            paymentStatus: 'PENDING',
            estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
          }
        });

        // 7. Create order items
        const orderItemsData = validatedItems.map(item => ({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        }));

        await prisma.orderItem.createMany({
          data: orderItemsData
        });

        // 8. Update restaurant analytics
        await prisma.restaurant.update({
          where: { id: restaurantId },
          data: {
            totalOrders: { increment: 1 },
            totalRevenue: { increment: totalAmount },
            avgOrderValue: {
              set: await calculateNewAvgOrderValue(restaurantId, totalAmount)
            }
          }
        });

        // 9. Create restaurant analytics entry for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.restaurantAnalytics.upsert({
          where: {
            restaurantId_date: {
              restaurantId,
              date: today
            }
          },
          update: {
            totalOrders: { increment: 1 },
            totalRevenue: { increment: totalAmount },
            avgOrderValue: { set: totalAmount } // Simplified calculation
          },
          create: {
            restaurantId,
            date: today,
            totalOrders: 1,
            totalRevenue: totalAmount,
            avgOrderValue: totalAmount,
            newCustomers: 0
          }
        });

        return order;
      });

      // Fetch complete order details for response
      const completeOrder = await prisma.order.findUnique({
        where: { id: result.id },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              email: true
            }
          },
          restaurant: {
            select: {
              name: true,
              phone: true,
              address: true
            }
          },
          deliveryAddress: true,
          orderItems: {
            include: {
              menuItem: {
                select: {
                  name: true,
                  image: true,
                  isVeg: true
                }
              }
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: completeOrder
      });

    } catch (error) {
      console.error('Create order error:', error);
      
      if (error.message.includes('not found') || error.message.includes('Invalid') || error.message.includes('not available')) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to create order'
        });
      }
    }
  },

  // GET user's order history with advanced filtering
  getUserOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const whereClause = {
        customerId: userId,
        ...(status && { status })
      };

      const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          restaurant: {
            select: {
              name: true,
              image: true,
              address: {
                select: {
                  city: true,
                  state: true
                }
              }
            }
          },
          deliveryAddress: true,
          orderItems: {
            include: {
              menuItem: {
                select: {
                  name: true,
                  image: true,
                  isVeg: true
                }
              }
            }
          },
          _count: {
            select: {
              orderItems: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit)
      });

      const totalCount = await prisma.order.count({
        where: whereClause
      });

      res.json({
        success: true,
        data: {
          orders,
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
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET single order details
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await prisma.order.findFirst({
        where: {
          id,
          customerId: userId // Ensure user can only see their own orders
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              email: true
            }
          },
          restaurant: {
            include: {
              address: true
            }
          },
          deliveryAddress: true,
          orderItems: {
            include: {
              menuItem: {
                select: {
                  name: true,
                  description: true,
                  image: true,
                  isVeg: true,
                  spiceLevel: true
                }
              }
            }
          },
          delivery: true
        }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });

    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // UPDATE order status (for restaurant owners/admins)
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, preparationTime } = req.body;
      
      // Validate status
      const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid order status'
        });
      }

      // Check if user can update this order (restaurant owner or admin)
      let whereClause = { id };
      
      if (req.user.role !== 'ADMIN') {
        // Restaurant owner can only update their restaurant's orders
        const order = await prisma.order.findUnique({
          where: { id },
          include: { restaurant: true }
        });

        if (!order || order.restaurant.ownerId !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: 'Access denied'
          });
        }
      }

      const updateData = {
        status,
        ...(preparationTime && { preparationTime: parseInt(preparationTime) }),
        ...(status === 'DELIVERED' && { actualDeliveryTime: new Date() })
      };

      const updatedOrder = await prisma.order.update({
        where: whereClause,
        data: updateData,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          restaurant: {
            select: {
              name: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

// Helper function for calculating average order value
async function calculateNewAvgOrderValue(restaurantId, newOrderAmount) {
  const result = await prisma.order.aggregate({
    where: { restaurantId },
    _avg: { totalAmount: true }
  });
  return result._avg.totalAmount || newOrderAmount;
}

module.exports = orderController;
