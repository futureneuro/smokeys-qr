import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.review.deleteMany();
  await prisma.customerContact.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.serviceRequestOption.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.table.deleteMany();
  await prisma.restaurant.deleteMany();

  // Create Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Smokey's BBQ",
      slug: 'smokeys-bbq',
      settings: {
        theme: 'dark',
        language: 'en',
      },
    },
  });

  // Create Tables
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    const table = await prisma.table.create({
      data: {
        number: i,
        restaurantId: restaurant.id,
        qrCode: `https://smokeys.local/table/${i}`,
        status: 'AVAILABLE',
      },
    });
    tables.push(table);
  }

  // Create Service Request Options
  const serviceOptions = await Promise.all([
    prisma.serviceRequestOption.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Call Waiter',
        icon: 'bell',
        order: 1,
        active: true,
      },
    }),
    prisma.serviceRequestOption.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Request Bill',
        icon: 'receipt',
        order: 2,
        active: true,
      },
    }),
    prisma.serviceRequestOption.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Order Drinks',
        icon: 'glass',
        order: 3,
        active: true,
      },
    }),
    prisma.serviceRequestOption.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Need Help',
        icon: 'help-circle',
        order: 4,
        active: true,
      },
    }),
  ]);

  // Create Staff Users
  const hashedAdminPassword = await bcryptjs.hash('admin123', 10);
  const hashedStaffPassword = await bcryptjs.hash('staff123', 10);

  const adminUser = await prisma.staff.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Admin User',
      email: 'admin@smokeys.com',
      passwordHash: hashedAdminPassword,
      role: 'ADMIN',
    },
  });

  const staffUser = await prisma.staff.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Staff User',
      email: 'staff@smokeys.com',
      passwordHash: hashedStaffPassword,
      role: 'STAFF',
    },
  });

  // Create Menu Categories
  const appetizerCategory = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Appetizers',
      order: 1,
    },
  });

  const mainCategory = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Main Course',
      order: 2,
    },
  });

  const sidesCategory = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Sides',
      order: 3,
    },
  });

  // Create Menu Items
  await Promise.all([
    // Appetizers
    prisma.menuItem.create({
      data: {
        categoryId: appetizerCategory.id,
        name: 'Smoked Wings',
        description: 'Tender smoked chicken wings with our signature dry rub',
        price: 12.99,
        active: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: appetizerCategory.id,
        name: 'Pulled Pork Nachos',
        description: 'Crispy tortilla chips topped with pulled pork and cheese',
        price: 14.99,
        active: true,
      },
    }),
    // Main Course
    prisma.menuItem.create({
      data: {
        categoryId: mainCategory.id,
        name: 'Smoked Brisket Platter',
        description: 'Slow-smoked brisket with our secret spice blend',
        price: 26.99,
        active: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: mainCategory.id,
        name: 'Pulled Pork Sandwich',
        description: 'Tender pulled pork on a toasted bun with coleslaw',
        price: 16.99,
        active: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: mainCategory.id,
        name: 'Ribs Combo',
        description: 'Half rack of baby back ribs with your choice of sides',
        price: 24.99,
        active: true,
      },
    }),
    // Sides
    prisma.menuItem.create({
      data: {
        categoryId: sidesCategory.id,
        name: 'Mac & Cheese',
        description: 'Creamy homemade mac and cheese',
        price: 5.99,
        active: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: sidesCategory.id,
        name: 'Cornbread',
        description: 'Warm, buttery cornbread',
        price: 3.99,
        active: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: sidesCategory.id,
        name: 'Smoked Beans',
        description: 'Slow-cooked beans with bacon and smoky flavor',
        price: 4.99,
        active: true,
      },
    }),
  ]);

  // Create Promotions
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.promotion.create({
      data: {
        restaurantId: restaurant.id,
        title: 'Happy Hour Special',
        description: '20% off drinks from 4-6 PM daily',
        linkUrl: 'https://smokeys.local/happy-hour',
        active: true,
        startDate: now,
        endDate: nextWeek,
      },
    }),
    prisma.promotion.create({
      data: {
        restaurantId: restaurant.id,
        title: 'Weekend Combo Deal',
        description: 'Buy any platter, get a free dessert',
        linkUrl: 'https://smokeys.local/combo-deal',
        active: true,
        startDate: now,
        endDate: nextWeek,
      },
    }),
  ]);

  // Create Settings
  await prisma.settings.create({
    data: {
      restaurantId: restaurant.id,
      throttleSeconds: 30,
      autoCloseMinutes: 15,
      googleReviewUrl: 'https://google.com/maps/place/smokeys-bbq',
      menuUrl: 'https://smokeys.local/menu',
      wifiName: 'Smokeys-Guest',
      wifiPassword: 'bbq2024!',
      aboutText:
        "Welcome to Smokey's BBQ! We serve authentic smoked meats prepared using traditional methods. Our team is here to provide exceptional service.",
      contactPhone: '(555) 123-4567',
      contactEmail: 'info@smokeys.local',
      socialLinks: {
        instagram: '@smokeys_bbq',
        facebook: 'https://facebook.com/smokeysbbq',
      },
    },
  });

  // Create Messages
  await Promise.all([
    prisma.message.create({
      data: {
        restaurantId: restaurant.id,
        type: 'WELCOME',
        content: 'Welcome to Smokey\'s BBQ! Scan the menu or request service using the buttons below.',
        active: true,
      },
    }),
    prisma.message.create({
      data: {
        restaurantId: restaurant.id,
        type: 'BUSY',
        content: 'We\'re currently very busy. Your request may take longer than usual.',
        active: true,
      },
    }),
    prisma.message.create({
      data: {
        restaurantId: restaurant.id,
        type: 'PROMOTION',
        content: 'Check out our weekend combo deals - buy any platter, get a free dessert!',
        active: true,
      },
    }),
  ]);

  console.log('Seed data created successfully!');
  console.log(`Restaurant: ${restaurant.name}`);
  console.log(`Tables: ${tables.length}`);
  console.log(`Service Options: ${serviceOptions.length}`);
  console.log(`Admin Email: admin@smokeys.com / Password: admin123`);
  console.log(`Staff Email: staff@smokeys.com / Password: staff123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
