# Flowise SDK

A TypeScript SDK for interacting with the Flowise API.

## Installation

```bash
npm install flowise-sdk
```

## Usage

```typescript
import { FlowiseClient } from 'flowise-sdk';

const flowise = new FlowiseClient({ baseUrl: 'http://localhost:3000' });

async function main() {
  const completion = await flowise.createPrediction({
    chatflowId: '<id>',
    question: "hello",
    streaming: true
  });

  for await (const chunk of completion) {
    console.log(chunk);
  }
}

main();
```

## API Reference

### `FlowiseClient`

The main class for interacting with the Flowise API.

#### Constructor

```typescript
new FlowiseClient(baseUrl?: string)
```

- `baseUrl`: Optional. The base URL for the Flowise API. Defaults to 'http://localhost:3000'.

#### Methods

##### `createPrediction(params: PredictionParams)`

Creates a new prediction.

- `params`: An object containing the following properties:
  - `chatflowId`: string - Chatflow ID to execute prediction
  - `question`: string - The question to ask.
  - `streaming`: boolean (optional) - Whether to stream the response.
  - `chatId`: string (optional) - Chat ID of the session
  - `overrideConfig`: object (optional) - Override configuration


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.