const express = require('express');
const router = express.Router();

const API_KEY = "8ffff5d67aae8b86c2410065";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;
const COMPANY_FEE_PERCENT = 2;

router.post('/', async (req, res) => {
  const { from, to, amount } = req.body;
  if (!from || !to || !amount) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  try {
    const apiRes = await fetch(`${BASE_URL}/${from}`);
    const data = await apiRes.json();

    if (data.result !== "success") {
      return res.status(500).json({ msg: "Failed to fetch rates" });
    }

    const rate = data.conversion_rates[to];
    if (!rate) return res.status(400).json({ msg: "Invalid target currency" });

    const converted = Number(amount) * rate;
    const fee = (converted * COMPANY_FEE_PERCENT) / 100;
    const total = converted - fee;

    res.json({
      from,
      to,
      amount: Number(amount),
      rate,
      converted,
      fee,
      totalAfterFee: total
    });
  } catch (err) {
    res.status(500).json({ msg: "Conversion failed", error: err.message });
  }
});

module.exports = router;