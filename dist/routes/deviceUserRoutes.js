"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deviceUser_controller_1 = require("../controllers/deviceUser.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
// Assign a device to a user
router.post('/assign', deviceUser_controller_1.assignDeviceToUser);
// Unassign a device from its current user
router.delete('/unassign/:deviceId', deviceUser_controller_1.unassignDevice);
// Get all devices for a specific user
router.get('/user/:userId/devices', deviceUser_controller_1.getUserDevices);
// Get the user assigned to a specific device
router.get('/device/:deviceId/user', deviceUser_controller_1.getDeviceUser);
exports.default = router;
