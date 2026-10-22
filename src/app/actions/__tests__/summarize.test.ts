import { summarizeJD } from '../summarize';
import { summarizeJobDescription } from '@/lib/gemini';

jest.mock('@/lib/gemini', () => ({
    summarizeJobDescription: jest.fn(),
}));

const mockSummarize = summarizeJobDescription as unknown as jest.Mock;

const LONG_JOB_DESCRIPTION =
    'We are looking for a senior frontend engineer to build data heavy dashboards with React, Next.js and TypeScript. You will own performance, accessibility and testing.';

describe('summarizeJD', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects a job description that is too short', async () => {
        const result = await summarizeJD('Hiring a developer.');

        expect(result).toEqual({ success: false, error: 'Job description is too short to summarize.' });
        expect(mockSummarize).not.toHaveBeenCalled();
    });

    it('returns the extracted requirements', async () => {
        mockSummarize.mockResolvedValue(['React', 'TypeScript']);

        const result = await summarizeJD(LONG_JOB_DESCRIPTION);

        expect(result).toEqual({ success: true, data: ['React', 'TypeScript'] });
    });

    it('returns an error when the AI request fails', async () => {
        mockSummarize.mockRejectedValue(new Error('Gemini is unavailable'));

        const result = await summarizeJD(LONG_JOB_DESCRIPTION);

        expect(result).toEqual({ success: false, error: 'Gemini is unavailable' });
    });
});
