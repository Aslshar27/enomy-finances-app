const mongoose = require('mongoose');

const QuoteHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  type: { type: String, enum: ['stock', 'crypto'], required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  change: { type: Number },
  changesPercentage: { type: Number },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuoteHistory', QuoteHistorySchema);