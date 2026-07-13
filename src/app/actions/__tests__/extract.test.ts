
import Module from 'module';

// Mock Clerk auth to bypass both server-only restriction and request context requirements
const clerkMock = {
    auth: async () => ({ userId: 'mock-user-id' })
};
const originalRequire = Module.prototype.require;
Module.prototype.require = function (this: any, id: string) {
    if (id === '@clerk/nextjs/server') {
        return clerkMock;
    }
    return originalRequire.call(this, id);
};

import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('extractText', () => {
    it('should return an error for unsupported file types', async () => {
        const { extractText } = await import('../extract');

        // Mock a File with an unsupported type
        const mockFile = {
            arrayBuffer: async () => new ArrayBuffer(0),
            type: 'text/plain',
            name: 'test.txt'
        };

        // Mock FormData
        const formData = {
            get: (_key: string) => (_key === 'file' ? mockFile : null)
        } as unknown as FormData;

        const result = await extractText(formData);

        assert.deepStrictEqual(result, {
            success: false,
            error: "Unsupported file type. Please upload PDF, Word, or Image."
        });
    });

    it('should return an error when no file is provided', async () => {
        const { extractText } = await import('../extract');

        // Mock FormData with no file
        const formData = {
            get: (_key: string) => null
        } as unknown as FormData;

        const result = await extractText(formData);

        assert.deepStrictEqual(result, {
            success: false,
            error: "No file provided"
        });
    });
});
