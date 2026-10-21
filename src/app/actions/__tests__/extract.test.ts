import { extractText } from '../extract';
import { auth } from '@clerk/nextjs/server';
import mammoth from 'mammoth';

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

jest.mock('mammoth', () => ({
    __esModule: true,
    default: {
        extractRawText: jest.fn(),
    },
}));

const mockAuth = auth as unknown as jest.Mock;
const mockExtractRawText = mammoth.extractRawText as unknown as jest.Mock;

const WORD_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function formDataWith(file: File | null) {
    const formData = new FormData();
    if (file) {
        formData.set('file', file);
    }
    return formData;
}

describe('extractText', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue({ userId: 'user_123' });
    });

    it('rejects the request when the user is not authenticated', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const result = await extractText(formDataWith(null));

        expect(result).toEqual({ success: false, error: 'Not authenticated' });
    });

    it('returns an error when no file is provided', async () => {
        const result = await extractText(formDataWith(null));

        expect(result).toEqual({ success: false, error: 'No file provided' });
    });

    it('returns an error for unsupported file types', async () => {
        const file = new File(['plain text'], 'notes.txt', { type: 'text/plain' });

        const result = await extractText(formDataWith(file));

        expect(result).toEqual({
            success: false,
            error: 'Unsupported file type. Please upload PDF, Word, or Image.',
        });
    });

    it('extracts the text of a Word document', async () => {
        mockExtractRawText.mockResolvedValue({ value: '  Senior Frontend Engineer  ' });
        const file = new File(['docx-bytes'], 'resume.docx', { type: WORD_MIME });

        const result = await extractText(formDataWith(file));

        expect(mockExtractRawText).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: true, text: 'Senior Frontend Engineer' });
    });

    it('returns an error when the Word document cannot be read', async () => {
        mockExtractRawText.mockRejectedValue(new Error('corrupt file'));
        const file = new File(['docx-bytes'], 'resume.docx', { type: WORD_MIME });

        const result = await extractText(formDataWith(file));

        expect(result).toEqual({ success: false, error: 'Failed to parse Word document.' });
    });
});
