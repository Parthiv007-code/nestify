const jwt = require('jsonwebtoken');

// This function is "middleware" — Express calls it before your route handler runs.
// It checks for a valid JWT in the Authorization header, and if valid,
// attaches the decoded user info to req.user so later handlers can use it.
//
// Analogy: like a function decorator in Python that checks auth before running the real function.
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // e.g. { userId: 3, role: 'OWNER' }
    next(); // move on to the actual route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Extra middleware: only allow OWNERs through (used on "create listing" etc.)
function requireOwner(req, res, next) {
  if (req.user.role !== 'OWNER') {
    return res.status(403).json({ error: 'Only owners can do this' });
  }
  next();
}

module.exports = { requireAuth, requireOwner };
