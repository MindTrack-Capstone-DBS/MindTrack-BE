const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).send({
      message: 'Token tidak disediakan!'
    });
  }

  const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

  try {
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET || 'mindtrack-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).send({
      message: 'Tidak terotorisasi!'
    });
  }
};

module.exports = verifyToken;