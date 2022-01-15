import { Router } from 'express';
import { registration, logout, login } from '../../../controllers/auth';
import guard from '../../../middlewares/guard';
const router = new Router();

router.post('/registration', registration);
router.post('/login', login);
router.post('/logout', guard, logout);

export default router;
