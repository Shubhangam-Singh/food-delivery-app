const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addressController = {
  // GET user's addresses
  getUserAddresses: async (req, res) => {
    try {
      const userId = req.user.id;

      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' }, // Default address first
          { createdAt: 'desc' }
        ]
      });

      res.json({
        success: true,
        data: addresses
      });

    } catch (error) {
      console.error('Get addresses error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // CREATE new address
  createAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        street, 
        city, 
        state, 
        zipCode, 
        landmark, 
        addressType, 
        isDefault,
        latitude,
        longitude
      } = req.body;

      if (!street || !city || !state || !zipCode) {
        return res.status(400).json({
          success: false,
          error: 'Street, city, state, and zipCode are required'
        });
      }

      // If setting as default, update other addresses
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false }
        });
      }

      const address = await prisma.address.create({
        data: {
          userId,
          street,
          city,
          state,
          zipCode,
          landmark: landmark || null,
          addressType: addressType || 'HOME',
          isDefault: isDefault || false,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null
        }
      });

      res.status(201).json({
        success: true,
        message: 'Address created successfully',
        data: address
      });

    } catch (error) {
      console.error('Create address error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create address'
      });
    }
  },

  // UPDATE address
  updateAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Check if address belongs to user
      const existingAddress = await prisma.address.findFirst({
        where: { id, userId }
      });

      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          error: 'Address not found'
        });
      }

      // If setting as default, update other addresses
      if (updateData.isDefault) {
        await prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false }
        });
      }

      const updatedAddress = await prisma.address.update({
        where: { id },
        data: {
          ...updateData,
          latitude: updateData.latitude ? parseFloat(updateData.latitude) : undefined,
          longitude: updateData.longitude ? parseFloat(updateData.longitude) : undefined
        }
      });

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: updatedAddress
      });

    } catch (error) {
      console.error('Update address error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update address'
      });
    }
  },

  // DELETE address
  deleteAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if address belongs to user
      const existingAddress = await prisma.address.findFirst({
        where: { id, userId }
      });

      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          error: 'Address not found'
        });
      }

      // Don't allow deletion of default address if user has other addresses
      if (existingAddress.isDefault) {
        const otherAddresses = await prisma.address.findMany({
          where: { 
            userId,
            id: { not: id }
          }
        });

        if (otherAddresses.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Cannot delete default address. Please set another address as default first.'
          });
        }
      }

      await prisma.address.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Address deleted successfully'
      });

    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete address'
      });
    }
  }
};

module.exports = addressController;
