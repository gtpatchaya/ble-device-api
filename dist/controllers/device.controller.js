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
exports.getLatestRecordBySerialNumber = exports.getDeviceRecordsBySerialNumber = exports.deleteDeviceBySerialNumber = exports.getPaginatedDevices = exports.registerDevice = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const response_1 = require("../utils/response");
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
