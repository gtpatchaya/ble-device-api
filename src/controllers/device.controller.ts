import { NextFunction, Request, Response } from 'express';
import prisma from '../prismaClient';
import { PaginatedResult } from '../types/api';
import { SerialNumberParams } from '../types/device.type';
import { RegisterDeviceBody } from '../types/register';
import { errorResponse, successResponse } from '../utils/response';

export const registerDevice = async (
  req: Request<{}, {}, RegisterDeviceBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber, model, deviceId, userId, name } = req.body;

    const existing = await prisma.device.findUnique({ where: { deviceId } });
    if (existing) {
      res.status(200).json(successResponse(200, 'Device already registered', null));
      return;
    }

    const device = await prisma.device.create({ data: { serialNumber, model,deviceId, userId, name} });

    res.status(200).json(successResponse(200, 'Device registered successfully', device));
  } catch (error) {
    next(error);
  }
};

export const getPaginatedDevices = async (
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

export const deleteDeviceBySerialNumber = async (
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

export const getDeviceRecordsBySerialNumber = async (
  req: Request<SerialNumberParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber } = req.params;

    const device = await prisma.device.findUnique({
      where: { serialNumber },
      include: {
        dataRecords: {
          orderBy: { recordNumber: 'desc' },
        },
      },
    });

    if (!device) {
      res.status(404).json(successResponse(404, 'Device not found', null));
      return;
    }

    res.status(200).json(successResponse(200, 'Success', device.dataRecords));
  } catch (error) {
    next(error);
  }
};

export const getLatestRecordBySerialNumber = async (
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
      orderBy: [{ recordNumber: 'desc' }, { timestamp: 'desc' }],
    });

    res.status(200).json(
      successResponse(200, latestRecord ? 'Success' : 'No record found', latestRecord)
    );
  } catch (error) {
    next(error);
  }
};

export const updateDeviceName = async (req: Request<{ deviceId: string }, {}, { name?: string }>, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { name } = req.body;

    if (!name) {
       res.status(400).json(errorResponse(400, 'Name is required'));
       return
    }

    const updated = await prisma.device.update({
      where: { deviceId },
      data: { name },
    });

    res.status(200).json(successResponse(200, 'Device name updated', updated));
  } catch (error) {
    console.error('Error updating device name:', error);
    res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const updateDeviceSerialNumber = async (req: Request<{ deviceId: string }, {}, { serialNumber?: string }>, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { serialNumber } = req.body;

    if (!serialNumber) {
       res.status(400).json(errorResponse(400, 'Serial number is required'));
       return
    }

    const updated = await prisma.device.update({
      where: { deviceId },
      data: { serialNumber },
    });

    res.status(200).json(successResponse(200, 'Serial number updated', updated));
  } catch (error) {
    console.error('Error updating serial number:', error);
    res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const updateDeviceLastValue = async (req: Request<{ deviceId: string }, {}, { value?: number }>, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { value } = req.body;

    if (value === null || value === undefined) {
       res.status(400).json(errorResponse(400, 'Value is required'));
       return
    }

    const updated = await prisma.device.update({
      where: { deviceId },
      data: {
        currentValue: value,
        currentAt: new Date(), // บันทึกเวลาอัปเดต
      },
    });

    res.status(200).json(successResponse(200, 'Last value updated', updated));
  } catch (error) {
    console.error('Error updating last value:', error);
    res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};


export const updateDeviceUnit = async (req: Request<{ deviceId: string }, {}, { unit?: string }>, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { unit } = req.body;

    if (unit === null || unit === undefined) {
       res.status(400).json(errorResponse(400, 'unit is required'));
       return
    }

    const updated = await prisma.device.update({
      where: { deviceId },
      data: {
        currentUnit: unit,
        currentAt: new Date(), // บันทึกเวลาอัปเดต
      },
    });

    res.status(200).json(successResponse(200, 'Last value updated', updated));
  } catch (error) {
    console.error('Error updating last value:', error);
    res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};





