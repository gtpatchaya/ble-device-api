import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prismaClient';

// Environment variables validation
const requiredEnvs = {
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
};

// Validation schema for login request
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Types for tokens
interface TokenPayload {
  userId: string;
  email: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Generate JWT tokens
export const generateTokens = (payload: TokenPayload): Tokens => {
  const accessToken = jwt.sign(
    payload,
    requiredEnvs.JWT_ACCESS_SECRET as string,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    payload,
    requiredEnvs.JWT_REFRESH_SECRET as string,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Set secure cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
      },
    });

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
      return;
    }

    console.log(user.password);
    console.log(password);
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
    });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    // Return success response with access token and user data
    res.status(200).json({
      status: 'success',
      data: {
        accessToken: tokens.accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors,
      });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        status: 'error',
        message: 'Refresh token not found',
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      requiredEnvs.JWT_REFRESH_SECRET as string
    ) as TokenPayload;

    // Generate new tokens
    const tokens = generateTokens({
      userId: decoded.userId,
      email: decoded.email,
    });

    // Set new refresh token
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    res.status(200).json({
      status: 'success',
      data: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token',
      });
      return;
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const logout = (req: Request, res: Response): void => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
}; 