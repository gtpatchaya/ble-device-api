import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { cookieOptions } from '../utils/auth';
import { errorResponse, successResponse } from '../utils/response';
import { generateTokens } from './auth.controller';

export const userController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, dateOfBirth } = req.body;

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json(errorResponse(400, 'อีเมลนี้มีผู้ลงทะเบียนไปแล้ว'));
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const temp = new Date(dateOfBirth);

      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword , dateOfBirth: temp },
      });

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
      });

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

      res.status(201).json(successResponse(201, 'User created', {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken: tokens.accessToken,
      }));
    } catch (error: any) {
      res.status(500).json({ error: error?.message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await prisma.user.findMany();
      res.status(200).json(successResponse(200, 'Success', users));
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users' });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (user) {
        res.status(200).json(successResponse(200, 'Success', user));
      } else {
        res.status(404).json(successResponse(404, 'User not found', null));
      }
    } catch (error) {
      res.status(500).json(successResponse(500, 'Internal server error', null));
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email } = req.body;
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { name, email },
      });
      res.status(200).json(successResponse(200, 'User updated', user));
    } catch (error) {
      res.status(500).json({ error: 'Error updating user' });
    }
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    try {
      await prisma.user.delete({
        where: { id: req.params.id },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error deleting user' });
    }
  },
};
