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
exports.updateDeviceUnit = exports.updateDeviceLastValue = exports.updateDeviceSerialNumber = exports.updateDeviceName = exports.getLatestRecordBySerialNumber = exports.getDeviceRecordsBySerialNumber = exports.deleteDeviceBySerialNumber = exports.getPaginatedDevices = exports.registerDevice = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const response_1 = require("../utils/response");
const registerDevice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber, model, deviceId, userId, name } = req.body;
        const existing = yield prismaClient_1.default.device.findUnique({ where: { deviceId } });
        if (existing) {
            res.status(200).json((0, response_1.successResponse)(200, 'Device already registered', null));
            return;
        }
        const device = yield prismaClient_1.default.device.create({ data: { serialNumber, model, deviceId, userId, name } });
        res.status(200).json((0, response_1.successResponse)(200, 'Device registered successfully', device));
    }
    catch (error) {
        next(error);
    }
});
exports.registerDevice = registerDevice;
const getPaginatedDevices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
        const totalItems = yield prismaClient_1.default.device.count();
        const devices = yield prismaClient_1.default.device.findMany({
            skip: (page - 1) * itemsPerPage,
            take: itemsPerPage,
            // orderBy: { createdAt: 'desc' }, // Uncomment if createdAt is available
        });
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const result = {
            items: devices,
            pagination: {
                currentPage: page,
                itemsPerPage,
                totalItems,
                totalPages,
            },
        };
        res.status(200).json((0, response_1.successResponse)(200, 'Success', result));
    }
    catch (error) {
        next(error);
    }
});
exports.getPaginatedDevices = getPaginatedDevices;
const deleteDeviceBySerialNumber = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber } = req.params;
        const device = yield prismaClient_1.default.device.findUnique({ where: { serialNumber } });
        if (!device) {
            res.status(404).json((0, response_1.successResponse)(404, 'Device not found', null));
            return;
        }
        yield prismaClient_1.default.device.delete({ where: { serialNumber } });
        res.status(200).json((0, response_1.successResponse)(200, 'Device deleted', null));
    }
    catch (error) {
        next(error);
    }
});
exports.deleteDeviceBySerialNumber = deleteDeviceBySerialNumber;
const getDeviceRecordsBySerialNumber = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber } = req.params;
        const device = yield prismaClient_1.default.device.findUnique({
            where: { serialNumber },
            include: {
                dataRecords: {
                    orderBy: { recordNumber: 'desc' },
                },
            },
        });
        if (!device) {
            res.status(404).json((0, response_1.successResponse)(404, 'Device not found', null));
            return;
        }
        res.status(200).json((0, response_1.successResponse)(200, 'Success', device.dataRecords));
    }
    catch (error) {
        next(error);
    }
});
exports.getDeviceRecordsBySerialNumber = getDeviceRecordsBySerialNumber;
const getLatestRecordBySerialNumber = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber } = req.params;
        const device = yield prismaClient_1.default.device.findUnique({ where: { serialNumber } });
        if (!device) {
            res.status(404).json((0, response_1.successResponse)(404, 'Device not found', null));
            return;
        }
        const latestRecord = yield prismaClient_1.default.dataRecord.findFirst({
            where: { deviceId: device.id },
            orderBy: [{ recordNumber: 'desc' }, { timestamp: 'desc' }],
        });
        res.status(200).json((0, response_1.successResponse)(200, latestRecord ? 'Success' : 'No record found', latestRecord));
    }
    catch (error) {
        next(error);
    }
});
exports.getLatestRecordBySerialNumber = getLatestRecordBySerialNumber;
const updateDeviceName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId } = req.params;
        const { name } = req.body;
        if (!name) {
            res.status(400).json((0, response_1.errorResponse)(400, 'Name is required'));
            return;
        }
        const updated = yield prismaClient_1.default.device.update({
            where: { deviceId },
            data: { name },
        });
        res.status(200).json((0, response_1.successResponse)(200, 'Device name updated', updated));
    }
    catch (error) {
        console.error('Error updating device name:', error);
        res.status(500).json((0, response_1.errorResponse)(500, 'Internal server error'));
    }
});
exports.updateDeviceName = updateDeviceName;
const updateDeviceSerialNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId } = req.params;
        const { serialNumber } = req.body;
        if (!serialNumber) {
            res.status(400).json((0, response_1.errorResponse)(400, 'Serial number is required'));
            return;
        }
        const updated = yield prismaClient_1.default.device.update({
            where: { deviceId },
            data: { serialNumber },
        });
        res.status(200).json((0, response_1.successResponse)(200, 'Serial number updated', updated));
    }
    catch (error) {
        console.error('Error updating serial number:', error);
        res.status(500).json((0, response_1.errorResponse)(500, 'Internal server error'));
    }
});
exports.updateDeviceSerialNumber = updateDeviceSerialNumber;
const updateDeviceLastValue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId } = req.params;
        const { value } = req.body;
        if (value === null || value === undefined) {
            res.status(400).json((0, response_1.errorResponse)(400, 'Value is required'));
            return;
        }
        const updated = yield prismaClient_1.default.device.update({
            where: { deviceId },
            data: {
                currentValue: value,
                currentAt: new Date(), // บันทึกเวลาอัปเดต
            },
        });
        res.status(200).json((0, response_1.successResponse)(200, 'Last value updated', updated));
    }
    catch (error) {
        console.error('Error updating last value:', error);
        res.status(500).json((0, response_1.errorResponse)(500, 'Internal server error'));
    }
});
exports.updateDeviceLastValue = updateDeviceLastValue;
const updateDeviceUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId } = req.params;
        const { unit } = req.body;
        if (unit === null || unit === undefined) {
            res.status(400).json((0, response_1.errorResponse)(400, 'unit is required'));
            return;
        }
        const updated = yield prismaClient_1.default.device.update({
            where: { deviceId },
            data: {
                currentUnit: unit,
                currentAt: new Date(), // บันทึกเวลาอัปเดต
            },
        });
        res.status(200).json((0, response_1.successResponse)(200, 'Last value updated', updated));
    }
    catch (error) {
        console.error('Error updating last value:', error);
        res.status(500).json((0, response_1.errorResponse)(500, 'Internal server error'));
    }
});
exports.updateDeviceUnit = updateDeviceUnit;
