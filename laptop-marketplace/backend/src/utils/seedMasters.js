require('dotenv').config();
const mongoose = require('mongoose');
const Master = require('../models/Master');
const { connectMongo } = require('./connectMongo');

const SEED_DATA = {
  brand: ['Dell', 'HP', 'Lenovo', 'Apple', 'MacBook', 'Asus', 'Acer', 'MSI'],
  processor: [
    'Intel Core i3',
    'Intel Core i5',
    'Intel Core i7',
    'Intel Core i9',
    'Intel Core Ultra 5',
    'Intel Core Ultra 7',
    'Intel Core Ultra 9',
    'AMD Ryzen 5',
    'AMD Ryzen 7',
    'AMD Ryzen 9',
    'Apple M1',
    'Apple M2',
    'Apple M3',
    'Apple M4',
  ],
  ram: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB'],
  storage: ['128 GB SSD', '256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD'],
  graphics: [
    'Integrated',
    'Intel Iris Xe',
    'Intel UHD',
    'NVIDIA GeForce MX450',
    'NVIDIA GeForce GTX 1650',
    'NVIDIA GeForce RTX 3050',
    'NVIDIA GeForce RTX 4060',
    'AMD Radeon Graphics',
  ],
  screenSize: ['13.3"', '14"', '15.6"', '16"', '17.3"'],
  condition: ['Excellent', 'Good', 'Fair'],
  os: ['Windows 10', 'Windows 11', 'macOS', 'Linux', 'No OS'],
  laptopType: ['Business', 'Gaming', 'Ultrabook', 'Workstation', 'Student', '2-in-1'],
  warranty: ['No Warranty', '1 Month', '3 Months', '6 Months', '1 Year'],
  color: ['Black', 'Silver', 'Grey', 'White', 'Blue'],
};

async function seedMasters() {
  await connectMongo();

  let created = 0;
  let skipped = 0;

  for (const [type, values] of Object.entries(SEED_DATA)) {
    for (let i = 0; i < values.length; i += 1) {
      const value = values[i];
      const existing = await Master.findOne({
        type,
        value: { $regex: new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });

      if (existing) {
        skipped += 1;
        continue;
      }

      await Master.create({
        type,
        value,
        displayOrder: i,
        isActive: true,
      });
      created += 1;
    }
  }

  console.log(`Masters seed complete: ${created} created, ${skipped} already existed.`);
  await mongoose.disconnect();
  process.exit(0);
}

seedMasters().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
