const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Check for JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables.");
      return res.status(500).json({ msg: 'Server misconfiguration: JWT secret not set' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.user || !decoded.user.id) {
      // Add debug info here
      console.error("Decoded JWT is missing user or user.id:", decoded);
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    // Add error logging for debugging
    console.error("JWT verification error:", err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};