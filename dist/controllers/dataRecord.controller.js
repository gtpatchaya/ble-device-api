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
exports.addMultipleDataRecords = exports.addDataRecord = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const response_1 = require("../utils/response");
const addDataRecord = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serialNumber, timestamp, value, unit, recordNumber } = req.body;
        const device = yield prismaClient_1.default.device.findUnique({ where: { serialNumber } });
        if (!device) {
            res.status(404).json((0, response_1.successResponse)(404, 'Device not found', null));
            return;
        }
        const valeTemp = +value;
        const unitStr = unit.toString();
        const recordNumberTemp = +recordNumber;
        const record = yield prismaClient_1.default.dataRecord.create({
            data: {
                deviceId: device.id,
                timestamp: new Date(timestamp).toISOString(),
                value: valeTemp,
                unit: unitStr,
                recordNumber: recordNumberTemp,
                serialNumber: serialNumber
            },
        });
        res.status(200).json((0, response_1.successResponse)(200, 'Record added successfully', record));
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
        if (!device) {
            res.status(404).json({ message: 'Device not found' });
            return;
        }
        // Fetch existing recordNumbers and timestamps for the device
        const existingRecords = yield prismaClient_1.default.dataRecord.findMany({
            where: { deviceId: device.id },
            select: { recordNumber: true, timestamp: true },
        });
        const existingRecordMap = new Map(existingRecords.map((record) => [record.recordNumber, record.timestamp.toISOString()]));
        console.log('Existing Record Map:', existingRecordMap);
        console.log('Incoming Records:', records);
        // Filter out records with duplicate recordNumbers or identical timestamps
        const filteredRecords = records.filter((record) => {
            const recordTimestampUTC = new Date(record.timestamp).toISOString(); // Convert to UTC 0
            return (!existingRecordMap.has(record.recordNumber) &&
                !Array.from(existingRecordMap.values()).includes(recordTimestampUTC));
        });
        if (filteredRecords.length === 0) {
            res.status(200).json((0, response_1.successResponse)(200, 'No new records to add', 0));
            return;
        }
        // Insert filtered records
        const createdRecords = yield prismaClient_1.default.dataRecord.createMany({
            data: filteredRecords.map((record) => ({
                deviceId: device.id,
                timestamp: new Date(record.timestamp).toISOString(), // Ensure UTC 0
                value: record.value,
                unit: record.unit.toString(),
                recordNumber: record.recordNumber,
            })),
        });
        res.status(200).json((0, response_1.successResponse)(200, createdRecords.count ? 'Records added successfully' : 'No record added', createdRecords.count));
    }
    catch (error) {
        next(error);
    }
});
exports.addMultipleDataRecords = addMultipleDataRecords;
