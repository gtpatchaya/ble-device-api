import type { RequestHandler } from 'express';
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// ✅ Public route
router.post('/', userController.create as RequestHandler);

// ✅ Protected routes
router.use(authenticateToken); 

router.get('/', userController.getAll as RequestHandler);
router.get('/:id', userController.getById as RequestHandler);
router.put('/:id', userController.update as RequestHandler);
router.delete('/:id', userController.remove as RequestHandler);

export default router;
