const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    address: { type: String, trim: true, default: '' },
    // Not required: a walk-in customer created by the owner has no login yet
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    // no-login = owner-created record without a login
    // pending   = customer registered, waiting for owner
    // approved  = can log in
    // rejected  = owner rejected the request
    accountStatus: {
      type: String,
      enum: ['no-login', 'pending', 'approved', 'rejected'],
      default: 'no-login',
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.statics.hashPassword = function (plainPassword) {
  return bcrypt.hash(plainPassword, 10);
};

module.exports = mongoose.model('User', userSchema);