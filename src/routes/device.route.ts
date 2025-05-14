import { Router } from 'express';
import {
  createDevice,
  deleteDeviceBySerialNumber,
  getDeviceRecordsBySerialNumber,
  getLatestRecordBySerialNumber,
  getPaginatedDevices
} from '../controllers/device.controller';

import {
  addDataRecord,
  addMultipleDataRecords
} from '../controllers/dataRecord.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/register', createDevice);
router.get('/', getPaginatedDevices);
router.delete('/:serialNumber', deleteDeviceBySerialNumber);

router.post('/data', addDataRecord);
router.post('/data/bulk', addMultipleDataRecords);
router.get('/:serialNumber/records', getLatestRecordBySerialNumber);
router.get('/:serialNumber/lastedRecord', getDeviceRecordsBySerialNumber);

export default router;