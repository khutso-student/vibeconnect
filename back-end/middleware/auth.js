const jwt = require('jsonwebtoken');

// ============================
// @desc   Protect Routes (Require Token)
// ============================
exports.protect = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded should contain user id + role
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// ============================
// @desc   Role Authorization
// ============================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {   // ✅ FIXED: roles not role
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    next();
  };
};
