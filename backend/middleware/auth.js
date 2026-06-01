const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  
  // Get token from header (handle both 'Authorization' and 'authorization')
  let token = req.header('Authorization') || req.headers.authorization;
  
  console.log("Auth middleware - Token received:", token ? "Yes" : "No");
  
  // Check if no token
  if (!token) {
    console.log("Auth middleware - No token provided");
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Remove 'Bearer ' prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, 'mysecretkey');
    console.log("Auth middleware - Token verified for user:", decoded.id);
    
    // Add user from payload
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log("Auth middleware - Token invalid:", err.message);
    
    // Check if token expired
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', expired: true });
    }
    
    res.status(401).json({ message: 'Token is not valid' });
  }
};