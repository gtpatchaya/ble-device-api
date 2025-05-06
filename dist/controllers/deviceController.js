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
exports.getDeviceRecords = exports.deleteDevice = exports.getDevices = exports.addDataRecord = exports.registerDevice = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const registerDevice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber, model } = req.body;
        const existing = yield prismaClient_1.default.device.findUnique({ where: { serialNumber } });
        if (existing) {
            res.status(400).json({ message: 'Device already registered' });
            return;
        }
        const device = yield prismaClient_1.default.device.create({ data: { serialNumber, model } });
        res.status(201).json(device);
    }
    catch (error) {
        next(error);
    }
});
exports.registerDevice = registerDevice;
const addDataRecord = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber, timestamp, value, unit } = req.body;
        const device = yield prismaClient_1.default.device.findUnique({ where: { serialNumber } });
        if (!device) {
            res.status(404).json({ message: 'Device not found' });
            return;
        }
        const record = yield prismaClient_1.default.dataRecord.create({
            data: {
                deviceId: device.id,
                timestamp: new Date(timestamp),
                value,
                unit,
            },
        });
        res.status(201).json(record);
    }
    catch (error) {
        next(error);
    }
});
exports.addDataRecord = addDataRecord;
const getDevices = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const devices = yield prismaClient_1.default.device.findMany({ include: { dataRecords: true } });
        res.status(200).json(devices);
    }
    catch (error) {
        next(error);
    }
});
exports.getDevices = getDevices;
const deleteDevice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber } = req.params;
        const device = yield prismaClient_1.default.device.findUnique({ where: { serialNumber } });
        if (!device) {
            res.status(404).json({ message: 'Device not found' });
            return;
        }
        yield prismaClient_1.default.device.delete({ where: { serialNumber } });
        res.status(200).json({ message: 'Device deleted' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteDevice = deleteDevice;
const getDeviceRecords = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber } = req.params;
        const device = yield prismaClient_1.default.device.findUnique({
            where: { serialNumber },
            include: { dataRecords: true },
        });
        if (!device) {
            res.status(404).json({ message: 'Device not found' });
            return;
        }
        res.status(200).json(device.dataRecords);
    }
    catch (error) {
        next(error);
    }
});
exports.getDeviceRecords = getDeviceRecords;
