import { HasagiClient } from '@hasagi/core';
import type { ConnectionOptions } from '@hasagi/core';

const client = new HasagiClient();
await client.connect({ useWebSocket: false } as ConnectionOptions);

console.log('Connected to client successfully');

while (true) {
    const response = await client.request('get', '/lol-store/v1/status');
    console.log('store status:', response);
    await new Promise((resolve) => setTimeout(resolve, 5000));
}
