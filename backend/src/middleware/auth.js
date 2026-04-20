const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || "SECRET_KEY";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("[AuthMiddleware] JWT Verification Error:", err.message);
      const message = err.name === 'TokenExpiredError' ? "Session expired. Please log in again." : "Invalid session. Please log in again.";
      return res.status(403).json({ success: false, message });
    }
    
    // UUID VALIDATION: Protect against legacy IDs in existing tokens after migration
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (decoded.id && !uuidRegex.test(decoded.id)) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid session format due to system update. Please log out and log in again." 
      });
    }

    req.user = decoded; // Contains id, email, role
    next();
  });
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return next();

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      // If token is invalid or expired, we just skip it but don't block
      return next();
    }
    
    // UUID VALIDATION
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (decoded.id && !uuidRegex.test(decoded.id)) {
      return next();
    }

    req.user = decoded;
    next();
  });
};

module.exports = { authenticateToken, optionalAuthenticateToken, authorizeRole };
