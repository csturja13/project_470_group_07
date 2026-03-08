const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "No token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ message: "No user role" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

module.exports = { requireAuth, requireRole };