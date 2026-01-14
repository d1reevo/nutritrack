import { Router } from 'express';
import { ProgressController } from '../controllers/progressController';
import { GamificationController } from '../controllers/gamificationController';

const router = Router();

router.get('/measurements', ProgressController.getMeasurements);
router.post('/measurements', ProgressController.addMeasurement);
router.delete('/measurements/:id', ProgressController.deleteMeasurement);

router.get('/gamification', GamificationController.getGamification);

export default router;
