import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as User from '../models/user.model.js';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.createUser({ name, email, password: hashedPassword });

    const token = jwt.sign(
      { id: user.User_ID, email: user.Email_ID, name: user.Name },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    const { Password, ...userWithoutPassword } = user;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('[register]', error);
    res.status(500).json({ error: 'Failed to register' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.User_ID, email: user.Email_ID, name: user.Name },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    const { Password, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { Password, ...userWithoutPassword } = user;
    res.json({ data: userWithoutPassword });
  } catch (error) {
    console.error('[getMe]', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}
