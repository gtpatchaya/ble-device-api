"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeviceUser = exports.getUserDevices = exports.unassignDevice = exports.assignDeviceToUser = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const assignDeviceToUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId, userId } = req.body;
        // Check if device exists
        const device = yield prismaClient_1.default.device.findUnique({
            where: { id: deviceId },
            include: { User: true }
        });
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        // Check if device is already assigned to a user
        if (device.userId) {
            return res.status(400).json({ error: 'Device is already assigned to a user' });
        }
        // Check if user exists
        const user = yield prismaClient_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Assign device to user
        const updatedDevice = yield prismaClient_1.default.device.update({
            where: { id: deviceId },
            data: { userId },
            include: { User: true }
        });
        res.json(updatedDevice);
    }
    catch (error) {
        console.error('Error assigning device to user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.assignDeviceToUser = assignDeviceToUser;
const unassignDevice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId } = req.params;
        // Check if device exists
        const device = yield prismaClient_1.default.device.findUnique({
            where: { id: Number(deviceId) }
        });
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        // Unassign device from user
        const updatedDevice = yield prismaClient_1.default.device.update({
            where: { id: Number(deviceId) },
            data: { userId: "" }
        });
        res.json(updatedDevice);
    }
    catch (error) {
        console.error('Error unassigning device:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.unassignDevice = unassignDevice;
const getUserDevices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Check if user exists
        const user = yield prismaClient_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Get all devices for the user
        const devices = yield prismaClient_1.default.device.findMany({
            where: { userId },
            include: { User: true }
        });
        res.json(devices);
    }
    catch (error) {
        console.error('Error getting user devices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getUserDevices = getUserDevices;
const getDeviceUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId } = req.params;
        const device = yield prismaClient_1.default.device.findUnique({
            where: { id: Number(deviceId) },
            include: { User: true }
        });
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json(device.User);
    }
    catch (error) {
        console.error('Error getting device user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getDeviceUser = getDeviceUser;
