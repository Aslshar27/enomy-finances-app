const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const QuoteHistory = require('../models/QuoteHistory');
const mongoose = require('mongoose');

// GET /api/dashboard/summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Dashboard summary requested by user:', userId);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Missing or invalid user id on request');
      return res.status(400).json({ msg: 'User id missing or invalid' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Total income
    const incomeAgg = await Transaction.aggregate([
      { $match: { user: userObjectId, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalIncome = incomeAgg[0]?.total || 0;

    // Total expense
    const expenseAgg = await Transaction.aggregate([
      { $match: { user: userObjectId, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpense = expenseAgg[0]?.total || 0;

    // Balance
    const balance = totalIncome - totalExpense;

    // Quotes searched
    const quotesSearched = await QuoteHistory.countDocuments({ user: userObjectId });

    res.json({
      income: totalIncome,
      expense: totalExpense,
      balance,
      quotesSearched
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ msg: 'Dashboard summary error', error: err.message });
  }
});

// GET /api/dashboard/activity
router.get('/activity', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Missing or invalid user id on request');
      return res.status(400).json({ msg: 'User id missing or invalid' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Last quote searched
    const lastQuote = await QuoteHistory.findOne({ user: userObjectId }).sort({ date: -1 });

    // Last conversion (if you have a model; else null for now)
    const lastConversion = null;

    res.json({
      lastQuote: lastQuote
        ? { symbol: lastQuote.symbol, date: lastQuote.date?.toISOString()?.slice(0, 10) }
        : null,
      lastConversion
    });
  } catch (err) {
    console.error('Dashboard activity error:', err);
    res.status(500).json({ msg: 'Dashboard activity error', error: err.message });
  }
});

module.exports = router;