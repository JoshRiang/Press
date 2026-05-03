import express from 'express';
import { getAllExercises } from '../controllers/exerciseController.js';

const router = express.Router();

router.get('/', getAllExercises);

export default router;
