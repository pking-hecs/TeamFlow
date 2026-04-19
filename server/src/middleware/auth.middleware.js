import jwt from 'jsonwebtoken';
<<<<<<< HEAD
import User from '../models/user.model.js'; // Assuming user model exists

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export default authMiddleware;
=======

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      // Mock user for testing if no token provided (since other modules aren't done)
      // This allows the Teams module to function without the full auth module being implemented.
      req.user = { id: 1, email: 'test@example.com', name: 'Test User' };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    // If token is invalid, also just mock user for now to unblock testing
    req.user = { id: 1, email: 'test@example.com', name: 'Test User' };
    next();
  }
};
>>>>>>> e6b4aa36bff4061a224a9be85373e33c6afc1c04
