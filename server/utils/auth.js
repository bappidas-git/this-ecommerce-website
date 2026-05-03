const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, resetToken, resetTokenExpires, ...rest } = user;
  return rest;
};

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
};

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
};

const attachUser = (db) => (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  const payload = verifyToken(token);
  if (!payload) {
    req.user = null;
    return next();
  }
  const user = db.get('users').find({ id: payload.id }).value();
  req.user = user ? sanitizeUser(user) : null;
  req.tokenPayload = payload;
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

const hashPassword = (plain) => bcrypt.hashSync(plain, 10);
const verifyPassword = (plain, hash) =>
  Boolean(hash) && bcrypt.compareSync(plain, hash);

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  sanitizeUser,
  signToken,
  verifyToken,
  extractToken,
  attachUser,
  requireAuth,
  requireRole,
  hashPassword,
  verifyPassword,
};
