import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT token for a user
 * @param {string} id - User MongoDB ObjectId
 * @param {string} role - User role
 * @returns {string} Signed JWT token
 */
export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
