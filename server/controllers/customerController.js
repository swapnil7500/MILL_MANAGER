const mongoose = require('mongoose');
const User = require('../models/User');
const Entry = require('../models/Entry');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const validPhone = (p) => /^[6-9]\d{9}$/.test(p);

// Never send passwordHash back to the browser
const safe = (user) => {
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
};

// Finds a customer (not admin) by :id, or sends the error response and returns null
const findCustomer = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid customer id' });
    return null;
  }
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'customer') {
    res.status(404).json({ message: 'Customer not found' });
    return null;
  }
  return user;
};

// POST /api/customers  (admin)
// Owner adds a walk-in customer. Password is optional: if given, the customer can log in at once.
const createCustomer = async (req, res) => {
  try {
    const { name, phone, address, password } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }
    const cleanPhone = String(phone).trim();
    if (!validPhone(cleanPhone)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
    }

    const data = {
      name: String(name).trim(),
      phone: cleanPhone,
      address: address ? String(address).trim() : '',
    };

    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      data.passwordHash = await User.hashPassword(String(password));
      data.accountStatus = 'approved';
    }

    const customer = await User.create(data);
    res.status(201).json({ customer: safe(customer) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A customer with this phone number already exists' });
    }
    console.error('createCustomer error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/customers?q=ram&status=approved  (admin)
const getCustomers = async (req, res) => {
  try {
    const { q, status } = req.query;
    const filter = { role: 'customer' };

    if (status) filter.accountStatus = status;
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: rx }, { phone: rx }];
    }

    const customers = await User.find(filter).sort({ name: 1 });
    res.json({ customers });
  } catch (err) {
    console.error('getCustomers error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/customers/pending  (admin)
// Waiting registration requests, with how many entries already exist under that phone
const getPending = async (req, res) => {
  try {
    const pending = await User.find({ role: 'customer', accountStatus: 'pending' }).sort({
      createdAt: 1,
    });

    const requests = await Promise.all(
      pending.map(async (u) => ({
        ...u.toObject(),
        entryCount: await Entry.countDocuments({ customer: u._id }),
      }))
    );

    res.json({ requests });
  } catch (err) {
    console.error('getPending error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/customers/:id  (admin)
const updateCustomer = async (req, res) => {
  try {
    const user = await findCustomer(req, res);
    if (!user) return;

    const { name, phone, address } = req.body;

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      user.name = String(name).trim();
    }
    if (phone !== undefined) {
      const cleanPhone = String(phone).trim();
      if (!validPhone(cleanPhone)) {
        return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
      }
      user.phone = cleanPhone;
    }
    if (address !== undefined) user.address = String(address).trim();

    await user.save();
    res.json({ customer: safe(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Another customer already has this phone number' });
    }
    console.error('updateCustomer error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/customers/:id/approve  (admin)
const approveCustomer = async (req, res) => {
  try {
    const user = await findCustomer(req, res);
    if (!user) return;

    if (user.accountStatus !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be approved' });
    }

    user.accountStatus = 'approved';
    await user.save();
    res.json({ customer: safe(user) });
  } catch (err) {
    console.error('approveCustomer error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/customers/:id/reject  (admin)
// Keeps the customer record and old entries, only removes the login request
const rejectCustomer = async (req, res) => {
  try {
    const user = await findCustomer(req, res);
    if (!user) return;

    if (user.accountStatus !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be rejected' });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { accountStatus: 'rejected' }, $unset: { passwordHash: 1 } }
    );
    res.json({ message: 'Request rejected' });
  } catch (err) {
    console.error('rejectCustomer error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/customers/:id/password  (admin)
// For customers who forgot their password: owner sets a new one (also activates the login)
const setCustomerPassword = async (req, res) => {
  try {
    const user = await findCustomer(req, res);
    if (!user) return;

    const { password } = req.body;
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    user.passwordHash = await User.hashPassword(String(password));
    user.accountStatus = 'approved';
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('setCustomerPassword error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getPending,
  updateCustomer,
  approveCustomer,
  rejectCustomer,
  setCustomerPassword,
};