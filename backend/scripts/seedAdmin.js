// One-off script: ensures an admin user exists with known credentials.
// Usage: node scripts/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Admin12345';
const ADMIN_NAME = 'Admin User';

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    let user = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

    if (user) {
      user.role = 'admin';
      user.password = ADMIN_PASSWORD; // pre-save hook re-hashes
      await user.save();
      console.log(`Promoted existing user ${ADMIN_EMAIL} to admin and reset password.`);
    } else {
      user = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin'
      });
      console.log(`Created admin user ${ADMIN_EMAIL}.`);
    }

    console.log('---');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Role:     admin`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
