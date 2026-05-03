import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { createUser, findByEmail } from '../models/userModel.js';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
});

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { user_id: userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
  );

  const refreshToken = jwt.sign(
    { user_id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );

  return { accessToken, refreshToken };
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existing = await findByEmail(validated.email);
    if (existing) {
      const err = new Error('Email already registered');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await argon2.hash(validated.password, {
      type: argon2.argon2id,
    });

    const user = await createUser({
      email: validated.email,
      password_hash: passwordHash,
      full_name: validated.full_name,
    });

    const { accessToken, refreshToken } = generateTokens(user.id);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          created_at: user.created_at,
        },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const loginSchema = z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    });

    const validated = loginSchema.parse(req.body);

    const user = await findByEmail(validated.email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const isValid = await argon2.verify(user.password_hash, validated.password);
    if (!isValid) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          created_at: user.created_at,
        },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      const err = new Error('No refresh token provided');
      err.statusCode = 401;
      throw err;
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const accessToken = jwt.sign(
        { user_id: decoded.user_id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
      );

      res.status(200).json({
        success: true,
        data: {
          accessToken,
        },
      });
    } catch (err) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};
