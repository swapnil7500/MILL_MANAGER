require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  const { MONGO_URI, ADMIN_NAME, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_PHONE || !ADMIN_PASSWORD) {
    console.error('Set ADMIN_PHONE and ADMIN_PASSWORD in .env first');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  const existing = await User.findOne({ phone: ADMIN_PHONE });
  if (existing) {
    console.log('Admin already exists, nothing changed');
  } else {
    const passwordHash = await User.hashPassword(ADMIN_PASSWORD);
    await User.create({
      name: ADMIN_NAME || 'Owner',
      phone: ADMIN_PHONE,
      passwordHash,
      role: 'admin',
    });
    console.log('Admin account created');
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});