const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// GET all transactions for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST a new transaction
router.post('/', auth, async (req, res) => {
  const { amount, description, type } = req.body;
  console.log('POST /api/transactions', { user: req.user, amount, description, type });
  if (!amount || !description || !type) {
    return res.status(400).json({ msg: 'Please provide all fields' });
  }
  try {
    const transaction = new Transaction({
      user: req.user.id,
      amount,
      description,
      type
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error('Transaction save error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// UPDATE a transaction
router.put('/:id', auth, async (req, res) => {
  const { amount, description, type } = req.body;
  try {
    // Only allow updating transactions owned by the logged-in user
    let transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    if (amount !== undefined) transaction.amount = amount;
    if (description !== undefined) transaction.description = description;
    if (type !== undefined) transaction.type = type;
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error('Transaction update error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE a transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.json({ msg: 'Transaction deleted', id: req.params.id });
  } catch (err) {
    console.error('Transaction delete error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;