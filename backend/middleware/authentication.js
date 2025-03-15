// middleware/authentication.js

const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
  try {
    // Check header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication invalid' 
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
      
      // Attach user to request object
      req.user = {
        userId: payload.userId,
        email: payload.email,
        userType: payload.userType
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication invalid',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error', 
      error: error.message 
    });
  }
};

module.exports = authenticateUser;