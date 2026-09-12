// In Next.js API routes there's no middleware chain like Express's
// app.use() — instead, each route handler calls a helper function itself
// and checks the result. Same underlying idea, different plumbing.

import jwt from 'jsonwebtoken';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Pass this the Next.js `request` object from inside a route handler.
// Returns the decoded { userId, role } payload, or null if missing/invalid.
export function getUserFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
