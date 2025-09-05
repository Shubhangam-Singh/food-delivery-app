const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fooddelivery.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+91-9999999999',
      role: 'ADMIN',
    },
  });

  const restaurantOwner = await prisma.user.create({
    data: {
      email: 'owner@tastybites.com',
      password: hashedPassword,
      firstName: 'Restaurant',
      lastName: 'Owner',
      phone: '+91-9876543210',
      role: 'RESTAURANT_OWNER',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'john.doe@email.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+91-9123456789',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'jane.smith@email.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+91-9123456788',
      role: 'CUSTOMER',
    },
  });

  console.log('👥 Created users');

  // Create addresses
  const restaurantAddress = await prisma.address.create({
    data: {
      street: '123 Food Street, Near City Mall',
      city: 'Vellore',
      state: 'Tamil Nadu',
      zipCode: '632014',
      landmark: 'Next to City Mall',
      latitude: 12.9716,
      longitude: 79.1588,
    },
  });

  const customerAddress1 = await prisma.address.create({
    data: {
      street: '456 Customer Lane, Apartment 2B',
      city: 'Vellore',
      state: 'Tamil Nadu',
      zipCode: '632014',
      landmark: 'Near VIT University',
      isDefault: true,
      userId: customer1.id,
    },
  });

  const customerAddress2 = await prisma.address.create({
    data: {
      street: '789 Residential Complex, Block C',
      city: 'Vellore',
      state: 'Tamil Nadu',
      zipCode: '632014',
      landmark: 'Behind Hospital',
      isDefault: true,
      userId: customer2.id,
    },
  });

  console.log('📍 Created addresses');

  // Create restaurants
  const restaurant1 = await prisma.restaurant.create({
    data: {
      name: 'Tasty Bites',
      description: 'Delicious North Indian cuisine delivered fresh and hot',
      phone: '+91-9876543210',
      email: 'contact@tastybites.com',
      deliveryFee: 30.0,
      minOrder: 150.0,
      rating: 4.5,
      cuisineType: ['North Indian', 'Chinese', 'Continental'],
      openTime: '10:00',
      closeTime: '23:00',
      ownerId: restaurantOwner.id,
      addressId: restaurantAddress.id,
    },
  });

  console.log('🏪 Created restaurants');

  // Create menu items
  const menuItems = await prisma.menuItem.createMany({
    data: [
      {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with spiced chicken pieces, served with raita and pickle',
        price: 280.0,
        category: 'Main Course',
        isVeg: false,
        spiceLevel: 'MEDIUM',
        restaurantId: restaurant1.id,
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Creamy paneer curry with rich tomato and butter gravy',
        price: 240.0,
        category: 'Main Course',
        isVeg: true,
        spiceLevel: 'MILD',
        restaurantId: restaurant1.id,
      },
      {
        name: 'Garlic Naan',
        description: 'Fresh baked naan bread with garlic and herbs',
        price: 60.0,
        category: 'Bread',
        isVeg: true,
        spiceLevel: 'MILD',
        restaurantId: restaurant1.id,
      },
      {
        name: 'Chicken Tikka',
        description: 'Grilled chicken pieces marinated in yogurt and spices',
        price: 320.0,
        category: 'Starter',
        isVeg: false,
        spiceLevel: 'SPICY',
        restaurantId: restaurant1.id,
      },
      {
        name: 'Veg Hakka Noodles',
        description: 'Stir-fried noodles with fresh vegetables and sauces',
        price: 180.0,
        category: 'Chinese',
        isVeg: true,
        spiceLevel: 'MEDIUM',
        restaurantId: restaurant1.id,
      },
      {
        name: 'Gulab Jamun (2 pcs)',
        description: 'Sweet milk dumplings in sugar syrup',
        price: 80.0,
        category: 'Dessert',
        isVeg: true,
        spiceLevel: 'MILD',
        restaurantId: restaurant1.id,
      },
    ],
  });

  console.log('🍽️  Created menu items');

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@fooddelivery.com / password123');
  console.log('Restaurant Owner: owner@tastybites.com / password123');
  console.log('Customer 1: john.doe@email.com / password123');
  console.log('Customer 2: jane.smith@email.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
