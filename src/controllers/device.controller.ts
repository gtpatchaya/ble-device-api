import { NextFunction, Request, Response } from 'express';
import prisma from '../prismaClient';
import { PaginatedResult } from '../types/api';
import { SerialNumberParams } from '../types/device.type';
import { RegisterDeviceBody } from '../types/register';
import { successResponse } from '../utils/response';

export const createDevice = async (
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


