import { NextFunction, Request, Response } from 'express';
import prisma from '../prismaClient';
import { PaginatedResult } from '../types/api';
import { successResponse } from '../utils/response';

// --- INTERFACES ---
interface RegisterDeviceBody {
  serialNumber: string;
  model: string;
}

interface AddDataRecordBody {
  serialNumber: string;
  timestamp: string;
  value: number;
  unit: string;
  recordNo: number;
}

interface SerialNumberParams {
  serialNumber: string;
}

// --------------------------------------------
// 1. REGISTER NEW DEVICE
// --------------------------------------------
/**
 * @route POST /api/devices
 * @body RegisterDeviceBody { serialNumber: string, model: string }
 * @returns 201 Created with new device
 */
export const registerDevice = async (
  req: Request<{}, {}, RegisterDeviceBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber, model } = req.body;

    const existing = await prisma.device.findUnique({ where: { serialNumber } });
    if (existing) {
      res.status(400).json(successResponse(400, 'Device already registered', null));
      return;
    }

    const device = await prisma.device.create({ data: { serialNumber, model } });

    res.status(201).json(successResponse(201, 'Device registered successfully', device));
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------
// 2. ADD DATA RECORD
// --------------------------------------------
/**
 * @route POST /api/records
 * @body AddDataRecordBody { serialNumber: string, timestamp: string, value: number, unit: string }
 * @returns 201 Created with new record
 */
export const addDataRecord = async (
  req: Request<{}, {}, AddDataRecordBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber, timestamp, value, unit, recordNo } = req.body;

    const device = await prisma.device.findUnique({ where: { serialNumber } });
    if (!device) {
      res.status(404).json(successResponse(404, 'Device not found', null));
      return;
    }

    const record = await prisma.dataRecord.create({
        data: {
          deviceId: device.id,
          timestamp: new Date(timestamp),
          value,
          unit,
          recordNo
        },
      
    });

    res.status(201).json(successResponse(201, 'Record added successfully', record));
  } catch (error) {
    next(error);
  }
};

export const addMultipleDataRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { serialNumber, records } = req.body;
  try {
    const device = await prisma.device.findUnique({ where: { serialNumber } });
    if (!device) res.status(404).json({ message: 'Device not found' });

    const createdRecords = await prisma.dataRecord.createMany({
      data: records.map((record: any) => ({
      deviceId: device?.id,
      timestamp: new Date(record.timestamp).toISOString(), // Ensure UTC 0
      value: record.value,
      unit: record.unit.toString(),
      recordNo: record.recordNo,
      })),
    });
    
    res.status(200).json(
      successResponse(200, createdRecords.count ? 'Records added successfully' : 'No record added', createdRecords.count)
    );

  } catch (error) {
    next(error);
  }
};


// --------------------------------------------
// 3. GET DEVICES WITH PAGINATION
// --------------------------------------------
/**
 * @route GET /api/devices?page=1&itemsPerPage=10
 * @query page: number, itemsPerPage: number
 * @returns 200 OK with paginated devices list
 */
export const getDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage as string) || 10;

    const totalItems = await prisma.device.count();

    const devices = await prisma.device.findMany({
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      // orderBy: { createdAt: 'desc' }, // Uncomment if createdAt is available
    });

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const result: PaginatedResult<typeof devices[number]> = {
      items: devices,
      pagination: {
        currentPage: page,
        itemsPerPage,
        totalItems,
        totalPages,
      },
    };

    res.status(200).json(successResponse(200, 'Success', result));
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------
// 4. DELETE DEVICE BY SERIAL NUMBER
// --------------------------------------------
/**
 * @route DELETE /api/devices/:serialNumber
 * @param serialNumber: string
 * @returns 200 OK if deleted
 */
export const deleteDevice = async (
  req: Request<SerialNumberParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber } = req.params;

    const device = await prisma.device.findUnique({ where: { serialNumber } });
    if (!device) {
      res.status(404).json(successResponse(404, 'Device not found', null));
      return;
    }

    await prisma.device.delete({ where: { serialNumber } });

    res.status(200).json(successResponse(200, 'Device deleted', null));
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------
// 5. GET ALL RECORDS FOR A DEVICE
// --------------------------------------------
/**
 * @route GET /api/devices/:serialNumber/records
 * @param serialNumber: string
 * @returns 200 OK with array of records
 */
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
      res.status(404).json(successResponse(404, 'Device not found', null));
      return;
    }

    res.status(200).json(successResponse(200, 'Success', device.dataRecords));
  } catch (error) {
    res.status(404).json(successResponse(404, 'Internal xx Error', error));
    next(error);
  }
};

// --------------------------------------------
// 6. GET LATEST RECORD FOR A DEVICE
// --------------------------------------------
/**
 * @route GET /api/devices/:serialNumber/latest-record
 * @param serialNumber: string
 * @returns 200 OK with latest data record (or null)
 */
export const getLastedDeviceRecords = async (
  req: Request<SerialNumberParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber } = req.params;

    const device = await prisma.device.findUnique({ where: { serialNumber } });

    if (!device) {
      res.status(404).json(successResponse(404, 'Device not found', null));
      return;
    }

    const latestRecord = await prisma.dataRecord.findFirst({
      where: { deviceId: device.id },
      orderBy: { timestamp: 'desc' },
    });

    res.status(200).json(
      successResponse(200, latestRecord ? 'Success' : 'No record found', latestRecord)
    );
  } catch (error) {
    next(error);
  }
};


