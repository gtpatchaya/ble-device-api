import { Router } from 'express';
import {
  addDataRecord,
  deleteDevice,
  getDeviceRecords,
  getDevices,
  getLastedDeviceRecords,
  registerDevice
} from '../controllers/deviceController';

const router = Router();

router.post('/devices/register', registerDevice);
router.post('/devices/data', addDataRecord);
router.get('/devices', getDevices);
router.get('/devices/:serialNumber/records', getDeviceRecords);
router.get('/devices/:serialNumber/lastedRecord', getLastedDeviceRecords);
router.delete('/devices/:serialNumber', deleteDevice);

export default router;