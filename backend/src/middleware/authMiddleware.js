import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Protect routes - Verifies Bearer JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }

  try {
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized, user no longer exists'));
    }

    next();
  } catch (error) {
    res.status(401);
    next(new Error('Not authorized, token is invalid or expired'));
  }
};

/**
 * Role-based access control
 * @param  {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(
          `Access denied: role '${req.user?.role}' is not permitted to access this resource`
        )
      );
    }
    next();
  };
};
