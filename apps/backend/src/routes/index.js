import express from 'express';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import exerciseRoutes from './exerciseRoutes.js';
import logRoutes from './logRoutes.js';
import sessionRoutes from './sessionRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/logs', logRoutes);
router.use('/sessions', sessionRoutes);

export default router;
