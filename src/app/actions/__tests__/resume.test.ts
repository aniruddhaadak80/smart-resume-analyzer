import { saveResume, getUserResumes } from '../resume';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn(),
}));

const mockAuth = auth as unknown as jest.Mock;
const mockResumeCreate = prisma.resume.create as unknown as jest.Mock;
const mockResumeFindMany = prisma.resume.findMany as unknown as jest.Mock;
const mockActivityCreate = prisma.userActivity.create as unknown as jest.Mock;

const RESUME_DATA = {
    userId: 'user_123',
    fileName: 'resume.pdf',
    jobTitle: 'Frontend Engineer',
    matchScore: 92,
    fileType: 'PDF' as const,
    content: { fullName: 'Ada Lovelace' },
};

describe('saveResume', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue({ userId: 'user_123' });
        mockResumeCreate.mockResolvedValue({ id: 'resume_1' });
        mockActivityCreate.mockResolvedValue({ id: 'activity_1' });
    });

    it('rejects the request when the user is not authenticated', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const result = await saveResume(RESUME_DATA);

        expect(result).toEqual({ success: false, error: 'Unauthorized' });
        expect(mockResumeCreate).not.toHaveBeenCalled();
    });

    it('rejects the request when the user tries to save for somebody else', async () => {
        mockAuth.mockResolvedValue({ userId: 'someone_else' });

        const result = await saveResume(RESUME_DATA);

        expect(result).toEqual({ success: false, error: 'Unauthorized' });
        expect(mockResumeCreate).not.toHaveBeenCalled();
    });

    it('saves the resume and logs the activity on the happy path', async () => {
        const result = await saveResume(RESUME_DATA);

        expect(result).toEqual({ success: true });
        expect(mockResumeCreate).toHaveBeenCalledTimes(1);
        expect(mockResumeCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: 'user_123',
                    fileName: 'resume.pdf',
                    matchScore: 92,
                }),
            })
        );
        expect(mockActivityCreate).toHaveBeenCalledTimes(1);
    });

    it('returns an error when the database write fails', async () => {
        mockResumeCreate.mockRejectedValue(new Error('database is down'));

        const result = await saveResume(RESUME_DATA);

        expect(result).toEqual({ success: false, error: 'Failed to save resume to database.' });
    });
});

describe('getUserResumes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue({ userId: 'user_123' });
    });

    it('rejects the request when the user is not authenticated', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const result = await getUserResumes();

        expect(result).toEqual({ success: false, error: 'Not authenticated' });
    });

    it('returns the resumes of the current user', async () => {
        const resumes = [{ id: 'resume_1', fileName: 'resume.pdf' }];
        mockResumeFindMany.mockResolvedValue(resumes);

        const result = await getUserResumes();

        expect(result).toEqual({ success: true, data: resumes });
        expect(mockResumeFindMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { userId: 'user_123' } })
        );
    });

    it('returns an error when the query fails', async () => {
        mockResumeFindMany.mockRejectedValue(new Error('database is down'));

        const result = await getUserResumes();

        expect(result).toEqual({ success: false, error: 'Failed to fetch resumes.' });
    });
});
