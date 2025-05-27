const express = require('express');
const router = express.Router();
const axios = require('axios');
const QuoteHistory = require('../models/QuoteHistory');
const auth = require('../middleware/auth');

// Mapping from symbols to CoinGecko IDs
const COINGECKO_SYMBOL_TO_ID = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  doge: 'dogecoin',
  ltc: 'litecoin',
  ada: 'cardano',
  xrp: 'ripple',
  bnb: 'binancecoin',
  dot: 'polkadot',
  avax: 'avalanche-2',
  link: 'chainlink',
  // add more as needed
};

router.get('/', auth, async (req, res) => {
  const { symbol, type } = req.query;
  try {
    let result;
    if (type === 'crypto') {
      // Map symbol to CoinGecko ID or use as is
      const coinId = COINGECKO_SYMBOL_TO_ID[symbol.trim().toLowerCase()] || symbol.trim().toLowerCase();
      const resp = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: { vs_currency: 'usd', ids: coinId }
      });
      if (!resp.data || !resp.data[0]) {
        return res.status(404).json({ msg: `Crypto not found (searched: "${coinId}")` });
      }
      result = {
        symbol: resp.data[0].symbol.toUpperCase(),
        name: resp.data[0].name,
        price: resp.data[0].current_price
      };
    } else if (type === 'stock') {
      // Use environment variable for API key
      const apiKey = process.env.FMP_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ msg: "Stock API key not set in server." });
      }
      const stockSymbol = symbol.trim().toUpperCase();
      const url = `https://financialmodelingprep.com/api/v3/quote/${stockSymbol}?apikey=${apiKey}`;
      try {
        const resp = await axios.get(url);
        if (!resp.data || !resp.data[0]) {
          return res.status(404).json({ msg: `Stock not found (searched: "${stockSymbol}")` });
        }
        result = {
          symbol: resp.data[0].symbol,
          name: resp.data[0].name,
          price: resp.data[0].price,
          change: resp.data[0].change,
          changesPercentage: resp.data[0].changesPercentage
        };
      } catch (apiErr) {
        console.error("FMP API error:", apiErr.response?.data || apiErr.message || apiErr);
        return res.status(500).json({ msg: "Stock API error", error: apiErr.response?.data || apiErr.message || apiErr });
      }
    } else {
      return res.status(400).json({ msg: 'Invalid type. Use "crypto" or "stock".' });
    }

    // Save to history
    await QuoteHistory.create({
      user: req.user.id,
      symbol: result.symbol,
      type,
      name: result.name,
      price: result.price,
      change: result.change,
      changesPercentage: result.changesPercentage
    });

    res.json(result);
  } catch (err) {
    console.error("Quote error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get quote history for logged-in user
router.get('/history', auth, async (req, res) => {
  try {
    const history = await QuoteHistory.find({ user: req.user.id }).sort({ date: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;