import { HasagiClient } from '@hasagi/core';
import fs from 'fs';

const client = new HasagiClient();
await client.connect({ useWebSocket: false });

console.log('Connected to client successfully');

try {
    const mythicJSON = await client.request(
        'get',
        '/lol-shoppefront/v1/stores/MYTHIC_SHOP',
    );
    fs.writeFileSync(
        './data/source/mythicShop.json',
        JSON.stringify(mythicJSON, null, 4),
        'utf8',
    );
    console.log('Mythic shop data saved to mythicShop.json');
} catch (error) {
    console.error('Error fetching catalog data:', error);
    process.exit(1);
}

try {
    const catalogJSON = await client.request('get', '/lol-store/v1/catalog');
    fs.writeFileSync(
        './data/source/catalog.json',
        JSON.stringify(catalogJSON, null, 4),
        'utf8',
    );
    console.log('Catalog data saved to catalog.json');
} catch (error) {
    console.error('Error saving catalog data:', error);
    process.exit(1);
}
