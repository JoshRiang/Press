import express from 'express';
import { createSession, getUserSessions, addLogToSession, deleteSession } from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createSession);
router.get('/', protect, getUserSessions);
router.post('/:id/logs', protect, addLogToSession);
router.delete('/:id', protect, deleteSession);

export default router;
