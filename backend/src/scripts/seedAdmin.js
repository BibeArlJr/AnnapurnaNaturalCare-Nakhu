require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  try {
    await connectDB();

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@example.com',
      password: hashed,
      role: 'admin',
    });

    console.log('Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
