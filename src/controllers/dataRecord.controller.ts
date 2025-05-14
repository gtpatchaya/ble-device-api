import { NextFunction, Request, Response } from 'express';
import prisma from '../prismaClient';
import { AddDataRecordBody } from '../types/dataRecord.type';
import { successResponse } from '../utils/response';

export const addDataRecord = async (
  req: Request<{}, {}, AddDataRecordBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber, timestamp, value, unit, recordNumber } = req.body;

    const device = await prisma.device.findUnique({ where: { serialNumber } });
    if (!device) {
      res.status(404).json(successResponse(404, 'Device not found', null));
      return;
    }

    const valeTemp = +value;
    const unitStr = unit.toString();
    const recordNumberTemp = +recordNumber;


    const record = await prisma.dataRecord.create({
        data: {
          deviceId: device.id,
          timestamp: new Date(timestamp).toISOString(),
          value: valeTemp,
          unit: unitStr,
          recordNumber: recordNumberTemp,
          serialNumber: serialNumber
        },
    });

    res.status(200).json(successResponse(200, 'Record added successfully', record));
  } catch (error) {
    next(error);
  }
};

export const addMultipleDataRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { serialNumber, records } = req.body;
  try {
    const device = await prisma.device.findUnique({ where: { serialNumber } });
    if (!device) {
      res.status(404).json({ message: 'Device not found' });
      return;
    }

    // Fetch existing recordNumbers and timestamps for the device
    const existingRecords = await prisma.dataRecord.findMany({
      where: { deviceId: device.id },
      select: { recordNumber: true, timestamp: true },
    });

    const existingRecordMap = new Map(
      existingRecords.map((record) => [record.recordNumber, record.timestamp.toISOString()])
    );

    console.log('Existing Record Map:', existingRecordMap);
    console.log('Incoming Records:', records);

    // Filter out records with duplicate recordNumbers or identical timestamps
    const filteredRecords = records.filter((record: any) => {
      const recordTimestampUTC = new Date(record.timestamp).toISOString(); // Convert to UTC 0
      return (
        !existingRecordMap.has(record.recordNumber) &&
        !Array.from(existingRecordMap.values()).includes(recordTimestampUTC)
      );
    });

    if (filteredRecords.length === 0) {
      res.status(200).json(successResponse(200, 'No new records to add', 0));
      return;
    }

    // Insert filtered records
    const createdRecords = await prisma.dataRecord.createMany({
      data: filteredRecords.map((record: any) => ({
        deviceId: device.id,
        timestamp: new Date(record.timestamp).toISOString(), // Ensure UTC 0
        value: record.value,
        unit: record.unit.toString(),
        recordNumber: record.recordNumber,
      })),
    });

    res.status(200).json(
      successResponse(
        200,
        createdRecords.count ? 'Records added successfully' : 'No record added',
        createdRecords.count
      )
    );
  } catch (error) {
    next(error);
  }
};