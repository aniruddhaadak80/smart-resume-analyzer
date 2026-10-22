import { logLogin } from '../user';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn(),
}));

jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));

const mockAuth = auth as unknown as jest.Mock;
const mockCookies = cookies as unknown as jest.Mock;
const mockActivityCreate = prisma.userActivity.create as unknown as jest.Mock;

describe('logLogin', () => {
    const cookieStore = {
        get: jest.fn(),
        set: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue({ userId: 'user_123' });
        mockCookies.mockResolvedValue(cookieStore);
        cookieStore.get.mockReturnValue(undefined);
        mockActivityCreate.mockResolvedValue({ id: 'activity_1' });
    });

    it('does nothing when the user id does not match the session', async () => {
        mockAuth.mockResolvedValue({ userId: 'someone_else' });

        const result = await logLogin('user_123');

        expect(result).toEqual({ logged: false });
        expect(mockActivityCreate).not.toHaveBeenCalled();
    });

    it('does nothing when the user is not authenticated', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const result = await logLogin('user_123');

        expect(result).toEqual({ logged: false });
        expect(mockActivityCreate).not.toHaveBeenCalled();
    });

    it('does not log the same login twice in one session', async () => {
        cookieStore.get.mockReturnValue({ name: 'has_logged_in_session', value: 'true' });

        const result = await logLogin('user_123');

        expect(result).toEqual({ logged: false });
        expect(mockActivityCreate).not.toHaveBeenCalled();
    });

    it('logs the login and sets the session cookie', async () => {
        const result = await logLogin('user_123');

        expect(result).toEqual({ logged: true });
        expect(mockActivityCreate).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ userId: 'user_123', actionType: 'LOGIN' }) })
        );
        expect(cookieStore.set).toHaveBeenCalledWith('has_logged_in_session', 'true', expect.anything());
    });

    it('still completes the login when the activity write fails', async () => {
        mockActivityCreate.mockRejectedValue(new Error('database is down'));

        const result = await logLogin('user_123');

        // The activity logger swallows write errors, so the login itself succeeds.
        expect(result).toEqual({ logged: true });
    });
});
