import { transcribeAudio, generateCoachResponse } from '../sarvam';
import { auth } from '@clerk/nextjs/server';

jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn(),
}));

jest.mock('sarvamai', () => {
    const completions = jest.fn();
    return {
        SarvamAIClient: jest.fn().mockImplementation(() => ({
            chat: { completions },
        })),
        __completions: completions,
    };
});

const mockAuth = auth as unknown as jest.Mock;
const mockCompletions = (jest.requireMock('sarvamai') as { __completions: jest.Mock }).__completions;

describe('transcribeAudio', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue({ userId: 'user_123' });
        global.fetch = jest.fn();
    });

    it('rejects the request when the user is not authenticated', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const result = await transcribeAudio(new FormData());

        expect(result).toEqual({ success: false, error: 'Not authenticated' });
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns an error when no audio file is provided', async () => {
        const result = await transcribeAudio(new FormData());

        expect(result).toEqual({ success: false, error: 'No audio file provided' });
    });

    it('returns the transcript on the happy path', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ transcript: 'my name is ada' }),
        });

        const formData = new FormData();
        formData.set('audio', new File(['audio'], 'recording.webm', { type: 'audio/webm' }));

        const result = await transcribeAudio(formData);

        expect(result).toEqual({ success: true, text: 'my name is ada' });
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('returns an error when the transcription service fails', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ error: { message: 'Service unavailable' } }),
        });

        const formData = new FormData();
        formData.set('audio', new File(['audio'], 'recording.webm', { type: 'audio/webm' }));

        const result = await transcribeAudio(formData);

        expect(result).toEqual({ success: false, error: 'Service unavailable' });
    });
});

describe('generateCoachResponse', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue({ userId: 'user_123' });
    });

    it('rejects the request when the user is not authenticated', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const result = await generateCoachResponse([{ role: 'user', content: 'hello' }]);

        expect(result).toEqual({ success: false, error: 'Not authenticated' });
        expect(mockCompletions).not.toHaveBeenCalled();
    });

    it('returns the coaching reply on the happy path', async () => {
        mockCompletions.mockResolvedValue({
            choices: [{ message: { content: 'Great answer, add more metrics.' } }],
        });

        const result = await generateCoachResponse([{ role: 'user', content: 'hello' }]);

        expect(result).toEqual({ success: true, content: 'Great answer, add more metrics.' });
    });

    it('returns an error when the AI request fails', async () => {
        mockCompletions.mockRejectedValue(new Error('Chat service is down'));

        const result = await generateCoachResponse([{ role: 'user', content: 'hello' }]);

        expect(result).toEqual({ success: false, error: 'Chat service is down' });
    });
});
