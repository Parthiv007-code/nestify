// This script populates the database with fake sample data so we have
// something real to test search/filtering against.
// Run manually with: node prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const owner = await prisma.user.create({
    data: {
      email: 'owner@example.com',
      password: hashedPassword,
      name: 'Priya Owner',
      role: 'OWNER',
      state: 'Tamil Nadu',
      district: 'Chennai',
      city: 'Kelambakkam',
      pincode: '600127',
    },
  });

  await prisma.listing.createMany({
    data: [
      {
        title: 'Cozy 2BHK near VIT Chennai',
        description: 'Bright, quiet apartment with a balcony, walking distance to VIT Chennai campus.',
        rent: 15000,
        state: 'Tamil Nadu',
        district: 'Chennai',
        city: 'Kelambakkam',
        pincode: '600127',
        bedrooms: 2,
        bathrooms: 1,
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
        ownerId: owner.id,
      },
      {
        title: 'Spacious 3BHK Independent House',
        description: 'Full house with a small garden, parking for two vehicles, family-friendly area.',
        rent: 22000,
        state: 'Tamil Nadu',
        district: 'Chennai',
        city: 'Sholinganallur',
        pincode: '600119',
        bedrooms: 3,
        bathrooms: 2,
        imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600',
        ownerId: owner.id,
      },
      {
        title: 'Budget 1BHK for Students',
        description: 'Compact and affordable, close to bus stand and colleges.',
        rent: 8000,
        state: 'Tamil Nadu',
        district: 'Thanjavur',
        city: 'Thanjavur',
        pincode: '613001',
        bedrooms: 1,
        bathrooms: 1,
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
        ownerId: owner.id,
      },
    ],
  });

  console.log('Seed data created. Sample owner login: owner@example.com / password123');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());