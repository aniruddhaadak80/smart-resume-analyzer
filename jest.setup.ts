/**
 * Global Jest setup.
 *
 * The Prisma client is mocked for every test file, so the suite runs in
 * milliseconds and never needs a real database connection.
 */

jest.mock('@/lib/prisma', () => ({
    prisma: {
        resume: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        jobApplication: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        userActivity: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
        },
    },
}));

// `revalidatePath` needs a running Next.js server, so it is stubbed out.
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));
