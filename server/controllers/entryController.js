const mongoose = require('mongoose');
const Entry = require('../models/Entry');
const User = require('../models/User');

const STATUSES = ['pending', 'in-progress', 'done', 'delivered'];
const SERVICES = ['flour', 'oil'];

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "2026-10-23" -> start or end of that day in Indian time
const parseDay = (str, endOfDay) => {
  const d = new Date(`${str}T${endOfDay ? '23:59:59.999' : '00:00:00'}+05:30`);
  return isNaN(d) ? null : d;
};

const CUSTOMER_FIELDS = 'name phone address';

// Finds an entry by :id, or sends the error response and returns null
const findEntry = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid entry id' });
    return null;
  }
  const entry = await Entry.findById(req.params.id);
  if (!entry) {
    res.status(404).json({ message: 'Entry not found' });
    return null;
  }
  return entry;
};

// POST /api/entries  (admin)
const createEntry = async (req, res) => {
  try {
    const { customerId, serviceType, itemName, weightKg, date, amount, paid, comment } = req.body;

    if (!customerId || !serviceType || !itemName || weightKg === undefined || weightKg === '') {
      return res
        .status(400)
        .json({ message: 'Customer, service type, item and weight are required' });
    }
    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({ message: 'Invalid customer' });
    }
    if (!SERVICES.includes(serviceType)) {
      return res.status(400).json({ message: 'Service type must be flour or oil' });
    }
    const weight = Number(weightKg);
    if (!(weight > 0)) {
      return res.status(400).json({ message: 'Weight must be a number greater than 0' });
    }

    let entryDate;
    if (date) {
      entryDate = new Date(date);
      if (isNaN(entryDate)) {
        return res.status(400).json({ message: 'Invalid date' });
      }
    }

    const customer = await User.findById(customerId);
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const entry = await Entry.create({
      customer: customer._id,
      serviceType,
      itemName: String(itemName).trim(),
      weightKg: weight,
      date: entryDate, // undefined means the model uses the current time
      amount: Number(amount) || 0,
      paid: Boolean(paid),
      comments: comment ? [{ text: String(comment).trim() }] : [],
    });

    await entry.populate('customer', CUSTOMER_FIELDS);
    res.status(201).json({ entry });
  } catch (err) {
    console.error('createEntry error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/entries?status=pending&from=2026-10-01&to=2026-10-31&q=ram&page=1  (admin)
const getEntries = async (req, res) => {
  try {
    const { status, serviceType, customer, from, to, q, page, limit } = req.query;
    const filter = {};

    if (status && STATUSES.includes(status)) filter.status = status;
    if (serviceType && SERVICES.includes(serviceType)) filter.serviceType = serviceType;
    if (customer && mongoose.isValidObjectId(customer)) filter.customer = customer;

    if (from || to) {
      const range = {};
      const start = from ? parseDay(from, false) : null;
      const end = to ? parseDay(to, true) : null;
      if (start) range.$gte = start;
      if (end) range.$lte = end;
      if (Object.keys(range).length) filter.date = range;
    }

    // Search matches item name, or customer name / phone
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      const users = await User.find({
        role: 'customer',
        $or: [{ name: rx }, { phone: rx }],
      }).select('_id');
      filter.$or = [{ itemName: rx }, { customer: { $in: users.map((u) => u._id) } }];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 50, 1), 200);

    const [entries, total] = await Promise.all([
      Entry.find(filter)
        .populate('customer', CUSTOMER_FIELDS)
        .sort({ date: -1, serialNo: -1 }) // newest first
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Entry.countDocuments(filter),
    ]);

    res.json({ entries, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error('getEntries error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/entries/:id  (admin) - edit details
const updateEntry = async (req, res) => {
  try {
    const entry = await findEntry(req, res);
    if (!entry) return;

    const { serviceType, itemName, weightKg, date, amount, paid } = req.body;

    if (serviceType !== undefined) {
      if (!SERVICES.includes(serviceType)) {
        return res.status(400).json({ message: 'Service type must be flour or oil' });
      }
      entry.serviceType = serviceType;
    }
    if (itemName !== undefined) {
      if (!String(itemName).trim()) {
        return res.status(400).json({ message: 'Item name cannot be empty' });
      }
      entry.itemName = String(itemName).trim();
    }
    if (weightKg !== undefined) {
      const weight = Number(weightKg);
      if (!(weight > 0)) {
        return res.status(400).json({ message: 'Weight must be a number greater than 0' });
      }
      entry.weightKg = weight;
    }
    if (date !== undefined) {
      const d = new Date(date);
      if (isNaN(d)) return res.status(400).json({ message: 'Invalid date' });
      entry.date = d;
    }
    if (amount !== undefined) {
      const a = Number(amount);
      if (isNaN(a) || a < 0) {
        return res.status(400).json({ message: 'Amount must be 0 or more' });
      }
      entry.amount = a;
    }
    if (paid !== undefined) entry.paid = Boolean(paid);

    await entry.save();
    await entry.populate('customer', CUSTOMER_FIELDS);
    res.json({ entry });
  } catch (err) {
    console.error('updateEntry error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/entries/:id/status  (admin) - the "work done" mark
const updateStatus = async (req, res) => {
  try {
    const entry = await findEntry(req, res);
    if (!entry) return;

    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(', ')}` });
    }

    entry.status = status;
    await entry.save();
    await entry.populate('customer', CUSTOMER_FIELDS);
    res.json({ entry });
  } catch (err) {
    console.error('updateStatus error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/entries/:id/comment  (admin)
const addComment = async (req, res) => {
  try {
    const entry = await findEntry(req, res);
    if (!entry) return;

    const text = req.body.text ? String(req.body.text).trim() : '';
    if (!text) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    entry.comments.push({ text });
    await entry.save();
    await entry.populate('customer', CUSTOMER_FIELDS);
    res.json({ entry });
  } catch (err) {
    console.error('addComment error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/entries/:id  (admin) - for wrongly entered records
const deleteEntry = async (req, res) => {
  try {
    const entry = await findEntry(req, res);
    if (!entry) return;

    await entry.deleteOne();
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error('deleteEntry error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/entries/mine?status=done  (customer)
// The customer id comes from the login cookie (req.user), never from the request
const getMyEntries = async (req, res) => {
  try {
    const filter = { customer: req.user._id };
    if (req.query.status && STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const entries = await Entry.find(filter)
      .select('-amount -paid') // customers don't see the owner's money details
      .sort({ date: -1, serialNo: -1 });

    res.json({ entries });
  } catch (err) {
    console.error('getMyEntries error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEntry,
  getEntries,
  updateEntry,
  updateStatus,
  addComment,
  deleteEntry,
  getMyEntries,
};