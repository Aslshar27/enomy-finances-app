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

const allowedOrigins = [
  'https://enomy-finances-app.vercel.app',
  'http://localhost:3000'
];

// CORS middleware with origin check and allowed headers
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);  // Allow non-browser requests like Postman
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

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

// CORS error handler
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    return res.status(403).json({ msg: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
