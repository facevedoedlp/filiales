import jwt from 'jsonwebtoken';

const { JWT_SECRET = 'change-me', JWT_EXPIRES_IN = '24h' } = process.env;

export const signToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    ...options,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
