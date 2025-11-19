import fs from 'fs';

const jsonData = fs.readFileSync('catalog.json', 'utf8');
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

  // map data to only include relevant fields
  items = items.map((item) => ({
    name: item.localizations?.en_US?.name,
    originalPrice: item.prices?.[0]?.cost,
    salePrice: item.sale?.prices?.[0]?.cost,
    champNumber: getChampNumber(item.tags),
  }));
  return items;
}

const parsedCatalog = parseCatalog(catalog);

fs.writeFileSync(
  'parsedCatalog.json',
  JSON.stringify(parsedCatalog, null, 2),
  'utf8'
);
