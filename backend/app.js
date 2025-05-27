const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const transactionsRoute = require('./routes/transactions');
const convertRoute = require('./routes/convert');
const quotesRoute = require('./routes/quotes');
const dashboardRoutes = require('./routes/dashboard');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/enomy-finances", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => res.send("Enomy-Finances API running"));
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoute);
app.use('/api/convert', convertRoute);
app.use('/api/quotes', quotesRoute);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));