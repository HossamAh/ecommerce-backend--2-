const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  console.log(req.headers);
  try {
    // Check for Authorization header in different cases
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    // Log the received header for debugging
    console.log('Auth Header:', authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authorization header missing or invalid',
        received: authHeader 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err.message);
        return res.status(401).json({ 
          message: 'Invalid token',
          error: err.message 
        });
      }
      
      // Attach decoded user to request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Internal server error in auth middleware',
      error: error.message 
    });
  }
};