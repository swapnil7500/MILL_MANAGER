const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
};

const sendUser = (user) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  role: user.role,
});

// POST /api/auth/register  (public)
const register = async (req, res) => {
  try {
    const { name, phone, address, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone and password are required' });
    }

    const cleanPhone = String(phone).trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const passwordHash = await User.hashPassword(String(password));
    const existing = await User.findOne({ phone: cleanPhone }).select('+passwordHash');

    if (existing) {
      if (existing.role === 'admin' || existing.accountStatus === 'approved') {
        return res
          .status(409)
          .json({ message: 'This number is already registered. Please log in.' });
      }
      if (existing.accountStatus === 'pending') {
        return res
          .status(409)
          .json({ message: 'A request for this number is already waiting for owner approval.' });
      }
      // Owner-created record (no-login) or a rejected one: attach the login request to it,
      // so the old entries stay linked to this phone number
      existing.passwordHash = passwordHash;
      existing.accountStatus = 'pending';
      await existing.save();
    } else {
      await User.create({
        name: String(name).trim(),
        phone: cleanPhone,
        address: address ? String(address).trim() : '',
        passwordHash,
        accountStatus: 'pending',
      });
    }

    res.status(201).json({
      message: 'Registration received. You can log in after the owner approves your account.',
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone: String(phone).trim() }).select('+passwordHash');

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }

    const match = await user.comparePassword(String(password));
    if (!match) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }

    // Customers must be approved. Admin skips this check.
    if (user.role !== 'admin' && user.accountStatus !== 'approved') {
      const message =
        user.accountStatus === 'pending'
          ? 'Your account is waiting for owner approval'
          : 'Your account is not active. Please contact the owner.';
      return res.status(403).json({ message });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      ...baseCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: sendUser(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token', baseCookieOptions);
  res.json({ message: 'Logged out' });
};

// GET /api/auth/me
const me = (req, res) => {
  res.json({ user: sendUser(req.user) });
};

module.exports = { register, login, logout, me };