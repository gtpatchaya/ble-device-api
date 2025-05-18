import type { RequestHandler } from 'express';
import { Router } from 'express';
import {
  assignDeviceToUser,
  getDevicesByUserId,
  getUserByDeviceId,
  unassignDevice
} from '../controllers/deviceUser.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// Assign a device to a user
router.post('/assign', assignDeviceToUser as RequestHandler);

// Unassign a device from its current user
router.delete('/unassign/:deviceId', unassignDevice as RequestHandler);

// Get all devices for a specific user
router.get('/devicebyuser/:userId', getDevicesByUserId as RequestHandler);

// Get the user assigned to a specific device
router.get('/userbydevice/:deviceId', getUserByDeviceId as RequestHandler);

export default router; 