import { NextFunction, Request, Response } from 'express';
import prisma from '../prismaClient';

// Interfaces for request bodies
interface RegisterDeviceBody {
  serialNumber: string;
  model: string;
}

interface AddDataRecordBody {
  serialNumber: string;
  timestamp: string;
  value: number;
  unit: string;
}

// Interface for request params
interface SerialNumberParams {
  serialNumber: string;
}

export const registerDevice = async (
  req: Request<{}, {}, RegisterDeviceBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber, model } = req.body;
    const existing = await prisma.device.findUnique({ where: { serialNumber } });
    if (existing) {
      res.status(400).json({ message: 'Device already registered' });
      return;
    }

    const device = await prisma.device.create({ data: { serialNumber, model } });
    res.status(201).json(device);
  } catch (error) {
    next(error);
  }
};

export const addDataRecord = async (
  req: Request<{}, {}, AddDataRecordBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber, timestamp, value, unit } = req.body;
    const device = await prisma.device.findUnique({ where: { serialNumber } });
    if (!device) {
      res.status(404).json({ message: 'Device not found' });
      return;
    }

    const record = await prisma.dataRecord.create({
      data: {
        deviceId: device.id,
        timestamp: new Date(timestamp),
        value,
        unit,
      },
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

export const getDevices = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const devices = await prisma.device.findMany({ include: { dataRecords: true } });
    res.status(200).json(devices);
  } catch (error) {
    next(error);
  }
};

export const deleteDevice = async (
  req: Request<SerialNumberParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber } = req.params;
    const device = await prisma.device.findUnique({ where: { serialNumber } });
    if (!device) {
      res.status(404).json({ message: 'Device not found' });
      return;
    }

    await prisma.device.delete({ where: { serialNumber } });
    res.status(200).json({ message: 'Device deleted' });
  } catch (error) {
    next(error);
  }
};

export const getDeviceRecords = async (
  req: Request<SerialNumberParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber } = req.params;
    const device = await prisma.device.findUnique({
      where: { serialNumber },
      include: { dataRecords: true },
    });
    if (!device) {
      res.status(404).json({ message: 'Device not found' });
      return;
    }
    res.status(200).json(device.dataRecords);
  } catch (error) {
    next(error);
  }
};