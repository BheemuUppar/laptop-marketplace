require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await AdminUser.findOne({ username });
  if (existing) {
    console.log(`Admin user "${username}" already exists`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.create({ username, passwordHash, role: 'admin' });
  console.log(`Admin user "${username}" created successfully`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
