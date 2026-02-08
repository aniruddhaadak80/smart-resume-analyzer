import { PrismaClient } from '@prisma/client';

// Use a global variable to store the Prisma Client instance
// to prevent multiple instances in development (Next.js hot reloading)

// @ts-ignore
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['warn', 'error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
