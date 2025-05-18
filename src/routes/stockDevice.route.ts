import { Router } from 'express';
import {
  createStockDevice,
  deleteStockDevice,
  getAllStockDevices,
  getStockDeviceByDeviceId,
  getStockDeviceBySerialNumber,
  updateStockDevice,
} from '../controllers/stockDevice.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.post('/', createStockDevice);
router.get('/', getAllStockDevices);
router.get('/:serialNumber', getStockDeviceBySerialNumber);
router.get('/device/:deviceId', getStockDeviceByDeviceId);
router.delete('/:serialNumber', deleteStockDevice);
router.put('/:serialNumber', updateStockDevice);

export default router;
