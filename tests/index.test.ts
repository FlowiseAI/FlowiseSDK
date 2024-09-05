import FlowiseClient from '../src/flowise-sdk';

// Mocking the global fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('FlowiseClient', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    it('should return a streaming generator when streaming is true', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ isStreaming: true }),
        });

        // Mock the fetch response to simulate streaming behavior
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode('chunk1'));
                controller.enqueue(new TextEncoder().encode('chunk2'));
                controller.close();
            },
        });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            body: stream,
        });

        const client = new FlowiseClient();
        const result = await client.createPrediction({
            chatflowId: 'fe1145fa-1b2b-45b7-b2ba-bcc5aaeb5ffd',
            question: 'What is the revenue of Apple?',
            streaming: true,
        });

        const chunks: string[] = [];
        for await (const chunk of result) {
            chunks.push(chunk);
        }

        expect(chunks).toEqual(['chunk1', 'chunk2']);
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should return a full JSON response when streaming is false', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ isStreaming: false }),
        });

        const mockJsonResponse = { revenue: '365 billion USD' };

        // Mock the fetch response to simulate non-streaming behavior
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockJsonResponse,
        });

        const client = new FlowiseClient();
        const result = await client.createPrediction({
            chatflowId: 'fe1145fa-1b2b-45b7-b2ba-bcc5aaeb5ffd',
            question: 'What is the revenue of Apple?',
            streaming: false,
        });

        expect(result).toEqual(mockJsonResponse);
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should return a full JSON response when streaming is not provided', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ isStreaming: false }),
        });

        const mockJsonResponse = { revenue: '365 billion USD' };

        // Mock the fetch response to simulate non-streaming behavior
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockJsonResponse,
        });

        const client = new FlowiseClient();
        const result = await client.createPrediction({
            chatflowId: 'fe1145fa-1b2b-45b7-b2ba-bcc5aaeb5ffd',
            question: 'What is the revenue of Apple?',
        });

        expect(result).toEqual(mockJsonResponse);
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if the prediction request fails', async () => {
        // Mock the chatflow GET request to indicate streaming is supported
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ isStreaming: false }),
        });

        // Mock the POST request to simulate an error response
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        const client = new FlowiseClient();

        await expect(
            client.createPrediction({
                chatflowId: 'test-chatflow',
                question: 'What is the revenue of Apple?',
            })
        ).rejects.toThrow('Error creating prediction');

        expect(mockFetch).toHaveBeenCalledTimes(2); // First for chatflow, second for prediction
    });
});
