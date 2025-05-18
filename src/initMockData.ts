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

    await prisma.stockDevice.create({
      data: {
        deviceId: 'D-MOCK-DEVICE-001',
        serialNumber: 'MOCK-DEVICE-001',
        createdAt: new Date(),
        lotNo: 'LOT-001',
        companyName: 'Mock Company',
      },
    })

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
        name: 'Mock Device',
        model: 'X200',
        userId: user.id,
        isActive: true,
        currentValue: 0.01,
        currentUnit: 'mg/L',
        currentAt: new Date(),
        deviceId: 'MOCK-DEVICE-001',
      },
    });

    console.log('✅ Mock user and device created');
  } else {
    console.log('✅ Mock user already exists');
  }
};
