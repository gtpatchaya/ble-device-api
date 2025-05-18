import { Router } from 'express';
import {
  deleteDeviceBySerialNumber,
  getDeviceRecordsBySerialNumber,
  getLatestRecordBySerialNumber,
  getPaginatedDevices,
  registerDevice,
  updateDeviceLastValue,
  updateDeviceName,
  updateDeviceSerialNumber,
  updateDeviceUnit
} from '../controllers/device.controller';

import {
  addDataRecord,
  addMultipleDataRecords
} from '../controllers/dataRecord.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/register', registerDevice);
router.get('/', getPaginatedDevices);
router.delete('/:serialNumber', deleteDeviceBySerialNumber);

router.post('/data', addDataRecord);
router.post('/data/bulk', addMultipleDataRecords);
router.get('/:serialNumber/records',getDeviceRecordsBySerialNumber );
router.get('/:serialNumber/lastedRecord', getLatestRecordBySerialNumber);

router.post('/updateName/:deviceId', updateDeviceName);
router.post('/updateSerialNumber/:deviceId', updateDeviceSerialNumber);
router.post('/updateLastValue/:deviceId', updateDeviceLastValue);
router.post('/updateDeviceUnit/:deviceId', updateDeviceUnit);

export default router;