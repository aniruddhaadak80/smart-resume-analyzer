import {
    getApplications,
    createApplication,
    updateApplication,
    deleteApplication,
} from '../tracker';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn(),
}));

const mockAuth = auth as unknown as jest.Mock;
const mockFindMany = prisma.jobApplication.findMany as unknown as jest.Mock;
const mockCreate = prisma.jobApplication.create as unknown as jest.Mock;
const mockUpdate = prisma.jobApplication.update as unknown as jest.Mock;
const mockDelete = prisma.jobApplication.delete as unknown as jest.Mock;
const mockActivityCreate = prisma.userActivity.create as unknown as jest.Mock;

const APPLICATION = {
    jobTitle: 'Frontend Engineer',
    company: 'Acme',
    location: 'Remote',
    jobUrl: 'https://example.com/job',
    notes: 'Referral from a friend',
    salary: '$120k',
};

describe('tracker actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue({ userId: 'user_123' });
        mockFindMany.mockResolvedValue([]);
        mockCreate.mockResolvedValue({ id: 'job_1', ...APPLICATION });
        mockUpdate.mockResolvedValue({ id: 'job_1', status: 'applied' });
        mockDelete.mockResolvedValue({ id: 'job_1' });
        mockActivityCreate.mockResolvedValue({ id: 'activity_1' });
    });

    describe('getApplications', () => {
        it('rejects the request when the user is not authenticated', async () => {
            mockAuth.mockResolvedValue({ userId: null });

            const result = await getApplications();

            expect(result).toEqual({ success: false, error: 'Not authenticated', data: [] });
        });

        it('returns the applications of the current user', async () => {
            const applications = [{ id: 'job_1', jobTitle: 'Frontend Engineer' }];
            mockFindMany.mockResolvedValue(applications);

            const result = await getApplications();

            expect(result).toEqual({ success: true, data: applications });
        });

        it('returns an error when the query fails', async () => {
            mockFindMany.mockRejectedValue(new Error('database is down'));

            const result = await getApplications();

            expect(result).toEqual({ success: false, error: 'Failed to fetch applications', data: [] });
        });
    });

    describe('createApplication', () => {
        it('rejects the request when the user is not authenticated', async () => {
            mockAuth.mockResolvedValue({ userId: null });

            const result = await createApplication(APPLICATION);

            expect(result).toEqual({ success: false, error: 'Not authenticated' });
            expect(mockCreate).not.toHaveBeenCalled();
        });

        it('creates the application and logs the activity', async () => {
            const result = await createApplication({ ...APPLICATION, status: 'applied' });

            expect(result.success).toBe(true);
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        userId: 'user_123',
                        jobTitle: 'Frontend Engineer',
                        company: 'Acme',
                    }),
                })
            );
            expect(mockActivityCreate).toHaveBeenCalledTimes(1);
        });

        it('returns an error when the database write fails', async () => {
            mockCreate.mockRejectedValue(new Error('database is down'));

            const result = await createApplication(APPLICATION);

            expect(result).toEqual({ success: false, error: 'Failed to create application' });
        });
    });

    describe('updateApplication', () => {
        it('rejects the request when the user is not authenticated', async () => {
            mockAuth.mockResolvedValue({ userId: null });

            const result = await updateApplication('job_1', { status: 'applied' });

            expect(result).toEqual({ success: false, error: 'Not authenticated' });
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it('updates the status of the application', async () => {
            const result = await updateApplication('job_1', { status: 'applied' });

            expect(result.success).toBe(true);
            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'job_1', userId: 'user_123' },
                    data: expect.objectContaining({ status: 'applied' }),
                })
            );
        });

        it('returns an error when the database write fails', async () => {
            mockUpdate.mockRejectedValue(new Error('database is down'));

            const result = await updateApplication('job_1', { status: 'applied' });

            expect(result).toEqual({ success: false, error: 'Failed to update application' });
        });
    });

    describe('deleteApplication', () => {
        it('rejects the request when the user is not authenticated', async () => {
            mockAuth.mockResolvedValue({ userId: null });

            const result = await deleteApplication('job_1');

            expect(result).toEqual({ success: false, error: 'Not authenticated' });
            expect(mockDelete).not.toHaveBeenCalled();
        });

        it('deletes the application and logs the activity', async () => {
            const result = await deleteApplication('job_1');

            expect(result).toEqual({ success: true });
            expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'job_1', userId: 'user_123' } });
            expect(mockActivityCreate).toHaveBeenCalledTimes(1);
        });

        it('returns an error when the database write fails', async () => {
            mockDelete.mockRejectedValue(new Error('database is down'));

            const result = await deleteApplication('job_1');

            expect(result).toEqual({ success: false, error: 'Failed to delete application' });
        });
    });
});
