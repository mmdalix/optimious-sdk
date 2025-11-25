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
  fetchUrl: 'https://api.optimious.com/parameters',
  intervalSeconds: 30 // optional, defaults to 30
});

// Initialize the client (fetches parameters and sets up polling)
await client.init();

// Get a parameter value
const value = client.getParam('myParameter');

// Clean up when done
client.destroy();
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

