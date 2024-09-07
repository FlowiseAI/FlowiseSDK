export interface PredictionData {
    chatflowId: string;
    question: string;
    overrideConfig?: Record<string, any>;
    chatId?: string;
    streaming?: boolean;
    history?: IMessage[];
    uploads?: IFileUpload[];
    leadEmail?: string
    action?: IAction
}

interface IAction {
    id?: string;
    elements?: Array<{
        type: string;
        label: string;
    }>;
    mapping?: {
        approve: string;
        reject: string;
        toolCalls: any[];
    };
}

interface IFileUpload {
    data?: string;
    type: string;
    name: string;
    mime: string;
}

interface IMessage {
    message: string;
    type: MessageType;
    role?: MessageType;
    content?: string;
}

type MessageType = 'apiMessage' | 'userMessage';

export interface StreamResponse {
    event: string;
    data: string;
}

interface FlowiseClientOptions {
    baseUrl?: string;
}

type PredictionResponse<T extends PredictionData> = T['streaming'] extends true
    ? AsyncGenerator<StreamResponse, void, unknown> // Streaming returns an async generator
    : Record<string, any>;

export default class FlowiseClient {
    private baseUrl: string;

    constructor(options: FlowiseClientOptions = {}) {
        this.baseUrl = options.baseUrl || 'http://localhost:3000';
    }

    // Method to create a new prediction and handle streaming response
    async createPrediction<T extends PredictionData>(
        data: T
    ): Promise<PredictionResponse<T>> {
        const { chatflowId, streaming } = data;

        // Check if chatflow is available to stream
        const chatFlowStreamingUrl = `${this.baseUrl}/api/v1/chatflows-streaming/${chatflowId}`;
        const resp = await fetch(chatFlowStreamingUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const chatFlowStreamingData = await resp.json();
        const isChatFlowAvailableToStream =
            chatFlowStreamingData.isStreaming || false;

        const predictionUrl = `${this.baseUrl}/api/v1/prediction/${chatflowId}`;

        if (isChatFlowAvailableToStream && streaming) {
            return {
                async *[Symbol.asyncIterator]() {
                    const response = await fetch(predictionUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`
                        );
                    }

                    //@ts-ignore
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split('\n');
                            buffer = lines.pop() || '';

                            for (const line of lines) {
                                if (line.trim() === '') continue;
                                if (line.startsWith('data:')) {
                                    const stringifiedJson = line.replace(
                                        'data:',
                                        ''
                                    );
                                    const event = JSON.parse(stringifiedJson);
                                    yield event;
                                }
                            }
                        }
                    } finally {
                        reader.releaseLock();
                    }
                },
            } as unknown as Promise<PredictionResponse<T>>;
        } else {
            // Make a POST request and handle streaming response
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            };

            try {
                const response = await fetch(predictionUrl, options);
                const resp = await response.json();
                return resp as Promise<PredictionResponse<T>>;
            } catch (error) {
                throw new Error('Error creating prediction');
            }
        }
    }
}
