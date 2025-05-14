// src/initMockData.ts
import bcrypt from 'bcryptjs';
import prisma from './prismaClient';

const SALT_ROUNDS = 10;

export const initMockData = async () => {
  const existingUser = await prisma.user.findFirst({
    where: { email: 'mock@example.com' },
  });

  if (!existingUser) {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash('securepassword123', SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: 'Mock User',
        email: 'mock@example.com',
        password:  hashedPassword,
      },
    });

    await prisma.device.create({
      data: {
        serialNumber: 'MOCK-DEVICE-001',
        model: 'X200',
        userId: user.id,
        isActive: true,
        currentValue: 0.01,
        currentUnit: 'mg/L',
        currentAt: new Date(),
      },
    });

    console.log('✅ Mock user and device created');
  } else {
    console.log('✅ Mock user already exists');
  }
};
