const mongoose = require('mongoose');
const Counter = require('./Counter');

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const entrySchema = new mongoose.Schema(
  {
    serialNo: { type: Number, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceType: { type: String, enum: ['flour', 'oil'], required: true },
    itemName: { type: String, required: true, trim: true },
    weightKg: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'done', 'delivered'],
      default: 'pending',
    },
    comments: [commentSchema],
    amount: { type: Number, default: 0, min: 0 },
    paid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-assign the next serial number to every new entry
entrySchema.pre('validate', async function () {
  if (this.isNew && !this.serialNo) {
    const counter = await Counter.findByIdAndUpdate(
      'entry',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.serialNo = counter.seq;
  }
});

entrySchema.index({ date: -1 });
entrySchema.index({ customer: 1, date: -1 });
entrySchema.index({ status: 1 });

module.exports = mongoose.model('Entry', entrySchema);