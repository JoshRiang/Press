import express from 'express';
import { createLog, getUserLogs, updateLog, deleteLog } from '../controllers/logController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createLog);
router.get('/', protect, getUserLogs);
router.put('/:id', protect, updateLog);
router.delete('/:id', protect, deleteLog);

export default router;
