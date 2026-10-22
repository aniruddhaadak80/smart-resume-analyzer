import { optimizeResume } from '../optimize';
import { auth } from '@clerk/nextjs/server';
import { generateContentWithRetry, analyzeResumeWithGemini } from '@/lib/gemini';

jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn(),
}));

jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn(),
}));

jest.mock('@/lib/gemini', () => ({
    generateContentWithRetry: jest.fn(),
    analyzeResumeWithGemini: jest.fn(),
}));

const mockAuth = auth as unknown as jest.Mock;
const mockGenerate = generateContentWithRetry as unknown as jest.Mock;
const mockAnalyze = analyzeResumeWithGemini as unknown as jest.Mock;

const RESUME = 'Built a React dashboard used by 200 users.';
const JOB = 'We are looking for a senior React developer with Next.js experience.';

describe('optimizeResume', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue({ userId: 'user_123' });
    });

    it('rejects the request when the user is not authenticated', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const result = await optimizeResume(RESUME, JOB);

        expect(result).toEqual({ success: false, error: 'Not authenticated' });
        expect(mockGenerate).not.toHaveBeenCalled();
    });

    it('returns the optimized resume on the happy path', async () => {
        const optimized = { fullName: 'Ada Lovelace', skills: ['React', 'Next.js'] };
        mockGenerate.mockResolvedValue({ text: JSON.stringify(optimized) });

        const result = await optimizeResume(RESUME, JOB);

        expect(result).toEqual({ success: true, data: optimized });
        expect(mockGenerate).toHaveBeenCalledTimes(1);
    });

    it('attaches the tone and grammar critique when it is requested', async () => {
        mockGenerate.mockResolvedValue({ text: JSON.stringify({ fullName: 'Ada Lovelace' }) });
        mockAnalyze.mockResolvedValue({ toneAndGrammar: { overallToneScore: 82 } });

        const result = await optimizeResume(RESUME, JOB, { includeToneCritique: true });

        expect(mockAnalyze).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            success: true,
            data: { fullName: 'Ada Lovelace', toneAndGrammar: { overallToneScore: 82 } },
        });
    });

    it('returns an error when the AI request fails', async () => {
        mockGenerate.mockRejectedValue(new Error('Gemini is unavailable'));

        const result = await optimizeResume(RESUME, JOB);

        expect(result).toEqual({ success: false, error: 'Gemini is unavailable' });
    });

    it('returns an error when the AI response cannot be parsed', async () => {
        mockGenerate.mockResolvedValue({ text: 'not json at all' });

        const result = await optimizeResume(RESUME, JOB);

        expect(result.success).toBe(false);
        expect(typeof (result as { error: string }).error).toBe('string');
    });
});
