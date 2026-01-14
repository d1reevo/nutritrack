import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const router = Router();

router.get('/progress/summary', AIController.getProgressSummary);
router.post('/recompute-progress', AIController.recomputeProgress);
router.get('/daily-quest', AIController.getDailyQuest);

export default router;
