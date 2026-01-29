import fs from 'fs';
import type {
    CatalogSaleRecord,
    MythicSaleRecord,
    RawCatalogSale,
    RawMythicSale,
    sectionType,
} from './lib/types.js';
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
    const minimizedSales = sales.map((sale) => {
        const rawStartDate = new Date(sale.sale!.startDate);
        const rawEndDate = new Date(sale.sale!.endDate);

        rawStartDate.setHours(rawStartDate.getHours() + 6);
        rawEndDate.setHours(rawEndDate.getHours() + 6);
        return {
            RiotItemID: sale.itemId,
            SaleStartAt: rawStartDate,
            SaleEndAt: rawEndDate,
            ItemType: 1,
            NormalPrice: sale.prices[0].cost,
            SalePrice: sale.sale!.prices[0].cost,
            PercentOff: Math.round(sale.sale!.prices[0].discount * 100),
            Currency: sale.prices[0].currency,
            IsActive: sale.active,
        };
    });
    return minimizedSales;
}

function getPrimaryPurchaseUnit(entry: RawMythicSale['catalogEntries'][0]) {
    // find first unit with payment options
    const unitWithPayment = entry.purchaseUnits.find(
        (unit) => unit.paymentOptions && unit.paymentOptions.length > 0,
    );

    return unitWithPayment;
}

function getAllIncludedItems(entry: RawMythicSale['catalogEntries'][0]) {
    const itemIds = entry.purchaseUnits.map((unit) => unit.fulfillment.itemId);

    return itemIds;
}

function minimizeMythicSale(sales: RawMythicSale[]): MythicSaleRecord[] {
    const now = new Date();

    const minimizedSales = sales.flatMap((sale) => {
        const section =
            sale.displayMetadata?.shoppefront?.categories[0] ??
            ('FEATURED' as sectionType);

        const saleStartAt = new Date(sale.startTime);

        return sale.catalogEntries.flatMap((entry) => {
            const primaryPurchaseUnit = getPrimaryPurchaseUnit(entry);

            if (!primaryPurchaseUnit) {
                return [];
            }
            const payment = primaryPurchaseUnit.paymentOptions![0].payments[0];
            const saleEndAt = new Date(entry.endTime);

            const includedItems = getAllIncludedItems(entry);

            const isBundle =
                entry.displayMetadata?.type?.toUpperCase() === 'BUNDLE' ||
                includedItems.length > 1;

            return {
                OfferID: entry.id,
                PrimaryItemID: primaryPurchaseUnit.fulfillment.itemId,
                SaleStartAt: saleStartAt,
                SaleEndAt: saleEndAt,
                Price: payment.finalDelta,
                Currency:
                    payment.name === 'lol_mythic_essence' ? 'ME' : 'UNKNOWN',
                IsActive: saleStartAt <= now && saleEndAt >= now,
                Section: section.toUpperCase() as sectionType,
                IsBundle: isBundle,
                IncludedItems: includedItems,
                BundleType:
                    entry.displayMetadata?.shoppefront?.bundleType || null,
            };
        });
    });
    return minimizedSales;
}

// proccessing functions
function processCatalogSales(): CatalogSaleRecord[] {
    const salesJsonData = fs.readFileSync('data/source/catalog.json', 'utf8');
    const salesData = JSON.parse(salesJsonData) as RawCatalogSale[];
    const filteredSales = filterCatalogSales(salesData);
    const minimizedSales = minimizeCatalogSale(filteredSales);

    return minimizedSales;
}

function processMythicSales() {
    const salesJsonData = fs.readFileSync(
        'data/source/mythicShop.json',
        'utf8',
    );
    const salesData = JSON.parse(salesJsonData);

    const minimizedSales = minimizeMythicSale(salesData);

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

async function upsertMythicSales(sales: MythicSaleRecord[]) {
    const { error } = await supabase
        .from('MythicSale')
        .upsert(sales, { onConflict: 'OfferID, SaleStartAt' });

    if (error) {
        console.error('Error upserting mythic sales:', error);
    } else {
        console.log('Mythic sales upserted successfully.');
    }
}

async function deactivateOldSales(table: 'CatalogSale' | 'MythicSale') {
    const now = new Date().toISOString();
    const { error } = await supabase
        .from(table)
        .update({ IsActive: false })
        .lt('SaleEndAt', now);

    if (error) {
        console.error('Error deactivating old sales:', error);
    } else {
        console.log('Old sales deactivated successfully.');
    }
}

function getNextRefreshTime(sales: CatalogSaleRecord[] | MythicSaleRecord[]) {
    const nextDefaultRefresh = new Date();
    nextDefaultRefresh.setDate(nextDefaultRefresh.getDate() + 1);
    nextDefaultRefresh.setHours(16, 0, 0, 0);
}

// main function
function main() {
    const sales = processCatalogSales();
    upsertCatalogSales(sales);
    deactivateOldSales('CatalogSale');

    const mythicSales = processMythicSales();
    upsertMythicSales(mythicSales);
    deactivateOldSales('MythicSale');
}

main();
