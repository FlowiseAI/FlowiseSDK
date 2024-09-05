// Actual import
// import { FlowiseClient } from 'flowise-sdk';
import { FlowiseClient } from '../src';

async function main() {
    const flowise = new FlowiseClient({ baseUrl: 'http://localhost:3000' });

    try {
        const completion = await flowise.createPrediction({
            chatflowId: 'fe1145fa-1b2b-45b7-b2ba-bcc5aaeb5ffd',
            question: 'hello there',
            streaming: true,
        });

        // Process each chunk of data as it is streamed
        for await (const chunk of completion) {
            console.log('Received chunk:', chunk);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
