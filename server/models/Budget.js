const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other']
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget cannot be negative']
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    default: () => new Date().getMonth() + 1
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  }
}, { timestamps: true });

// Ensure a user can only have one budget per category per month/year
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
