import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { errorResponse, successResponse } from '../utils/response';

export const assignDeviceToUser = async (req: Request, res: Response) => {
  try {
    const { deviceId, userId } = req.body;

    // Check if device exists
    const device = await prisma.device.findUnique({
      where: { deviceId: deviceId },
      include: { User: true }
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check if device is already assigned to a user
    if (device.userId) {
      return res.status(400).json({ error: 'Device is already assigned to a user' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Assign device to user
    const updatedDevice = await prisma.device.update({
      where: { deviceId: deviceId },
      data: { userId },
      include: { User: true }
    });

    res.status(200).json(successResponse(200, 'Success', updatedDevice));
  } catch (error) {
    console.error('Error assigning device to user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unassignDevice = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    // Check if device exists
    const device = await prisma.device.findUnique({
      where: { id: Number(deviceId) }
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Unassign device from user
    const updatedDevice = await prisma.device.update({
      where: { id: Number(deviceId) },
      data: { userId: "" }
    });

    res.json(updatedDevice);
  } catch (error) {
    console.error('Error unassigning device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDevicesByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(200).json(successResponse(200, 'Success', []));
    }

    // Get all devices for the user
    const devices = await prisma.device.findMany({
      where: { userId },
      include: { User: true }
    });


    return res.status(200).json(successResponse(200, 'Success', devices));
  } catch (error) {
    console.error('Error getting user devices:', error);
    res.status(500).json(errorResponse(500, 'Success'));
  }
};

export const getUserByDeviceId = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    const device = await prisma.device.findUnique({
      where: { deviceId: deviceId },
      include: { User: true }
    });

    if (!device || !device.User) {
      res.status(200).json(successResponse(200, 'Success', null));
      return
    }
   
    res.status(200).json(successResponse(200, 'Success', device.User));
  } catch (error) {
    console.error('Error getting device user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 