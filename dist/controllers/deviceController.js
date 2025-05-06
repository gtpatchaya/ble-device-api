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
exports.getLastedDeviceRecords = exports.getDeviceRecords = exports.deleteDevice = exports.getDevices = exports.addMultipleDataRecords = exports.addDataRecord = exports.registerDevice = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const response_1 = require("../utils/response");
// --------------------------------------------
// 1. REGISTER NEW DEVICE
// --------------------------------------------
/**
 * @route POST /api/devices
 * @body RegisterDeviceBody { serialNumber: string, model: string }
 * @returns 201 Created with new device
 */
const registerDevice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber, model } = req.body;
        const existing = yield prismaClient_1.default.device.findUnique({ where: { serialNumber } });
        if (existing) {
            res.status(400).json((0, response_1.successResponse)(400, 'Device already registered', null));
            return;
        }
        const device = yield prismaClient_1.default.device.create({ data: { serialNumber, model } });
        res.status(201).json((0, response_1.successResponse)(201, 'Device registered successfully', device));
    }
    catch (error) {
        next(error);
    }
});
exports.registerDevice = registerDevice;
// --------------------------------------------
// 2. ADD DATA RECORD
// --------------------------------------------
/**
 * @route POST /api/records
 * @body AddDataRecordBody { serialNumber: string, timestamp: string, value: number, unit: string }
 * @returns 201 Created with new record
 */
const addDataRecord = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber, timestamp, value, unit, recordNo } = req.body;
        const device = yield prismaClient_1.default.device.findUnique({ where: { serialNumber } });
        if (!device) {
            res.status(404).json((0, response_1.successResponse)(404, 'Device not found', null));
            return;
        }
        const record = yield prismaClient_1.default.dataRecord.create({
            data: {
                deviceId: device.id,
                timestamp: new Date(timestamp),
                value,
                unit,
                recordNo
            },
        });
        res.status(201).json((0, response_1.successResponse)(201, 'Record added successfully', record));
    }
    catch (error) {
        next(error);
    }
});
exports.addDataRecord = addDataRecord;
const addMultipleDataRecords = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { serialNumber, records } = req.body;
    try {
        const device = yield prismaClient_1.default.device.findUnique({ where: { serialNumber } });
        if (!device)
            res.status(404).json({ message: 'Device not found' });
        const createdRecords = yield prismaClient_1.default.dataRecord.createMany({
            data: records.map((record) => ({
                deviceId: device === null || device === void 0 ? void 0 : device.id,
                timestamp: new Date(record.timestamp),
                value: record.value,
                unit: record.unit,
                recordNo: record.recordNo,
            })),
        });
        res.status(200).json((0, response_1.successResponse)(200, createdRecords.count ? 'Records added successfully' : 'No record added', createdRecords.count));
    }
    catch (error) {
        next(error);
    }
});
exports.addMultipleDataRecords = addMultipleDataRecords;
// --------------------------------------------
// 3. GET DEVICES WITH PAGINATION
// --------------------------------------------
/**
 * @route GET /api/devices?page=1&itemsPerPage=10
 * @query page: number, itemsPerPage: number
 * @returns 200 OK with paginated devices list
 */
const getDevices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.getDevices = getDevices;
// --------------------------------------------
// 4. DELETE DEVICE BY SERIAL NUMBER
// --------------------------------------------
/**
 * @route DELETE /api/devices/:serialNumber
 * @param serialNumber: string
 * @returns 200 OK if deleted
 */
const deleteDevice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.deleteDevice = deleteDevice;
// --------------------------------------------
// 5. GET ALL RECORDS FOR A DEVICE
// --------------------------------------------
/**
 * @route GET /api/devices/:serialNumber/records
 * @param serialNumber: string
 * @returns 200 OK with array of records
 */
const getDeviceRecords = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber } = req.params;
        const device = yield prismaClient_1.default.device.findUnique({
            where: { serialNumber },
            include: { dataRecords: true },
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
exports.getDeviceRecords = getDeviceRecords;
// --------------------------------------------
// 6. GET LATEST RECORD FOR A DEVICE
// --------------------------------------------
/**
 * @route GET /api/devices/:serialNumber/latest-record
 * @param serialNumber: string
 * @returns 200 OK with latest data record (or null)
 */
const getLastedDeviceRecords = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber } = req.params;
        const device = yield prismaClient_1.default.device.findUnique({ where: { serialNumber } });
        if (!device) {
            res.status(404).json((0, response_1.successResponse)(404, 'Device not found', null));
            return;
        }
        const latestRecord = yield prismaClient_1.default.dataRecord.findFirst({
            where: { deviceId: device.id },
            orderBy: { timestamp: 'desc' },
        });
        res.status(200).json((0, response_1.successResponse)(200, latestRecord ? 'Success' : 'No record found', latestRecord));
    }
    catch (error) {
        next(error);
    }
});
exports.getLastedDeviceRecords = getLastedDeviceRecords;
