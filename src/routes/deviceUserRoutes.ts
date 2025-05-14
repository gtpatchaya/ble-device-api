import type { RequestHandler } from 'express';
import { Router } from 'express';
import {
  assignDeviceToUser,
  getDeviceUser,
  getUserDevices,
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
router.get('/user/:userId/devices', getUserDevices as RequestHandler);

// Get the user assigned to a specific device
router.get('/device/:deviceId/user', getDeviceUser as RequestHandler);

export default router; 