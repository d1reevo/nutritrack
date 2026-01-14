import { Router } from 'express';
import { MealController } from '../controllers/mealController';

const router = Router();

router.get('/', MealController.getDays);
router.get('/:date', MealController.getDayDetails);
router.post('/:date/meals', MealController.addMeal);
router.put('/meals/:id', MealController.editMeal);
router.delete('/meals/:id', MealController.deleteMeal);

export default router;
