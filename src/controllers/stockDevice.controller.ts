import { NextFunction, Request, Response } from 'express';
import prisma from '../prismaClient';
import { successResponse } from '../utils/response';

export const createStockDevice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber, lotNo, companyName, deviceId } = req.body;

    const existing = await prisma.stockDevice.findUnique({
      where: { serialNumber },
    });

    if (existing) {
      res.status(409).json(successResponse(409, 'StockDevice already exists', null));
      return;
    }

    const stockDevice = await prisma.stockDevice.create({
      data: { serialNumber, lotNo, companyName, deviceId },
    });

    res.status(201).json(successResponse(201, 'StockDevice created', stockDevice));
  } catch (error) {
    next(error);
  }
};

export const getAllStockDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stockDevices = await prisma.stockDevice.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(successResponse(200, 'Success', stockDevices));
  } catch (error) {
    next(error);
  }
};

export const getStockDeviceBySerialNumber = async (
  req: Request<{ serialNumber: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber } = req.params;

    const stockDevice = await prisma.stockDevice.findUnique({
      where: { serialNumber },
    });

    if (!stockDevice) {
      res.status(404).json(successResponse(404, 'StockDevice not found', null));
      return;
    }

    res.status(200).json(successResponse(200, 'Success', stockDevice));
  } catch (error) {
    next(error);
  }
};

export const getStockDeviceByDeviceId = async (
  req: Request<{ deviceId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { deviceId } = req.params;

    const stockDevice = await prisma.stockDevice.findUnique({
      where: { deviceId },
    });

    if (!stockDevice) {
      res.status(404).json(successResponse(404, 'StockDevice not found', null));
      return;
    }

    res.status(200).json(successResponse(200, 'Success', stockDevice));
  } catch (error) {
    next(error);
  }
};

export const deleteStockDevice = async (
  req: Request<{ serialNumber: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber } = req.params;

    const stockDevice = await prisma.stockDevice.findUnique({
      where: { serialNumber },
    });

    if (!stockDevice) {
      res.status(404).json(successResponse(404, 'StockDevice not found', null));
      return;
    }

    await prisma.stockDevice.delete({ where: { serialNumber } });

    res.status(200).json(successResponse(200, 'StockDevice deleted', null));
  } catch (error) {
    next(error);
  }
};

export const updateStockDevice = async (
  req: Request<{ serialNumber: string }, {}, { lotNo?: string; companyName?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { serialNumber } = req.params;
    const { lotNo, companyName } = req.body;

    const existing = await prisma.stockDevice.findUnique({
      where: { serialNumber },
    });

    if (!existing) {
      res.status(404).json(successResponse(404, 'StockDevice not found', null));
      return;
    }

    const updated = await prisma.stockDevice.update({
      where: { serialNumber },
      data: {
        ...(lotNo && { lotNo }),
        ...(companyName && { companyName }),
      },
    });

    res.status(200).json(successResponse(200, 'StockDevice updated', updated));
  } catch (error) {
    next(error);
  }
};
