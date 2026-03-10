
import { extractText } from '../extract';

describe('extractText', () => {
    it('should return an error for unsupported file types', async () => {
        // Mock a File with an unsupported type
        const mockFile = {
            arrayBuffer: async () => new ArrayBuffer(0),
            type: 'text/plain',
            name: 'test.txt'
        };

        // Mock FormData
        const formData = {
            get: (key: string) => (key === 'file' ? mockFile : null)
        } as unknown as FormData;

        const result = await extractText(formData);

        expect(result).toEqual({
            success: false,
            error: "Unsupported file type. Please upload PDF, Word, or Image."
        });
    });

    it('should return an error when no file is provided', async () => {
        // Mock FormData with no file
        const formData = {
            get: (key: string) => null
        } as unknown as FormData;

        const result = await extractText(formData);

        expect(result).toEqual({
            success: false,
            error: "No file provided"
        });
    });
});
