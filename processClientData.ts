import fs from 'fs';
import type { CatalogSaleRecord, RawCatalogSale } from './lib/types.js';
import { supabase } from './lib/supabase.ts';

// helpers
function filterCatalogSales(salesData: RawCatalogSale[]) {
    salesData = salesData.filter((sale) => sale.sale != null);
    salesData = salesData.filter(
        (sale) => sale.inventoryType == 'CHAMPION_SKIN',
    );
    salesData = salesData.filter((sale) => sale.subInventoryType != 'RECOLOR');
    return salesData;
}

function minimizeCatalogSale(sales: RawCatalogSale[]): CatalogSaleRecord[] {
    const minimizedSales = sales.map((sale) => ({
        RiotItemID: sale.itemId,
        SaleStartAt: new Date(sale.sale!.startDate),
        SaleEndAt: new Date(sale.sale!.endDate),
        ItemType: 1,
        NormalPrice: sale.prices[0].cost,
        SalePrice: sale.sale!.prices[0].cost,
        PercentOff: Math.round(sale.sale!.prices[0].discount * 100),
        IsActive: sale.active,
    }));
    return minimizedSales;
}

// proccessing functions
function processCatalogSales() {
    const salesJsonData = fs.readFileSync('data/source/catalog.json', 'utf8');
    const salesData = JSON.parse(salesJsonData) as RawCatalogSale[];
    const filteredSales = filterCatalogSales(salesData);
    const minimizedSales = minimizeCatalogSale(filteredSales);

    return minimizedSales;
}

// upsert functions
async function upsertCatalogSales(sales: CatalogSaleRecord[]) {
    const { error } = await supabase
        .from('CatalogSale')
        .upsert(sales, { onConflict: 'RiotItemID,SaleStartAt,SaleEndAt' });

    if (error) {
        console.error('Error upserting catalog sales:', error);
    } else {
        console.log('Catalog sales upserted successfully.');
    }
}

async function deactivateOldSales() {
    const now = new Date().toISOString();
    const { error } = await supabase
        .from('CatalogSale')
        .update({ IsActive: false })
        .lt('SaleEndAt', now);

    if (error) {
        console.error('Error deactivating old sales:', error);
    } else {
        console.log('Old sales deactivated successfully.');
    }
}

// main function
function main() {
    const sales = processCatalogSales();
    upsertCatalogSales(sales);
    deactivateOldSales();
}

main();
