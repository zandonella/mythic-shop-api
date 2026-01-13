import fs from 'fs';

const jsonData = fs.readFileSync('data/source/catalog.json', 'utf8');
const catalog = JSON.parse(jsonData);

function getChampNumber(tags) {
    if (!tags) return null;
    for (const tag of tags) {
        const match = tag.match(/champions_(\d+)/);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return null;
}

function parseCatalog(items) {
    // filter items as needed
    items = items.filter((item) => item.sale != null);
    items = items.filter((item) => item.inventoryType == 'CHAMPION_SKIN');
    items = items.filter((item) => item.subInventoryType != 'RECOLOR');

    // map data to only include relevant fields
    items = items.map((item) => ({
        name: item.localizations?.en_US?.name,
        originalPrice: item.prices?.[0]?.cost,
        salePrice: item.sale?.prices?.[0]?.cost,
        champNumber: getChampNumber(item.tags),
        contentID: item.itemInstanceId,
        itemID: item.itemId,
    }));
    return items;
}

const parsedCatalog = parseCatalog(catalog);

fs.writeFileSync(
    'data/parsed/sales.json',
    JSON.stringify(parsedCatalog, null, 4),
    'utf8',
);
