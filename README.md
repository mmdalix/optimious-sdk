# Optimious SDK

TypeScript SDK for interacting with the Optimious API.

## Installation

```bash
npm install optimious-sdk
```

## Usage

```typescript
import { OptimiousClient } from 'optimious-sdk';

const client = new OptimiousClient({
  baseUrl: 'https://api.optimious.com',
  apiKey: 'your-api-key'
});

// Use the client
await client.ping();
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run dev
```

## License

ISC

