import fs from 'fs';
import type {
    CatalogSaleRecord,
    MythicSaleRecord,
    RawCatalogSale,
    RawMythicSale,
    sectionType,
    price,
} from './lib/types.js';
import { supabase } from './lib/supabase.ts';

// helpers
function minDate(a: Date | null, b: Date | null): Date | null {
    if (a === null) return b;
    if (b === null) return a;
    return a.getTime() < b.getTime() ? a : b;
}

function getPriceInfo(prices: price[]): price {
    const price = prices.find((p) => p.cost != 0);
    if (!price) {
        return { cost: 0, currency: 'UNKNOWN', discount: 0 };
    }
    return price;
}

function getItemTypeByName(name: string) {
    switch (name) {
        case 'CHAMPION_SKIN':
            return 1;
        case 'RECOLOR':
            return 2;
        case 'EMOTE':
            return 3;
        case 'SUMMONER_ICON':
            return 4;
        case 'WARD_SKIN':
            return 6;
        default:
            return 0;
    }
}

function hasLimitedAvailabilityTag(sale: RawCatalogSale) {
    return (
        sale.tags?.some((tag) => tag.toLowerCase().includes('limited')) ?? false
    );
}

function filterCatalogSales(salesData: RawCatalogSale[]) {
    salesData = salesData.filter((sale) => sale.sale != null);
    salesData = salesData.filter(
        (sale) => sale.inventoryType == 'CHAMPION_SKIN',
    );
    salesData = salesData.filter((sale) => sale.subInventoryType != 'RECOLOR');
    salesData = salesData.filter((sale) => !hasLimitedAvailabilityTag(sale));
    return salesData;
}

function getLimitedSales(salesData: RawCatalogSale[]) {
    salesData = salesData.filter((sale) => sale.inactiveDate != null);
    salesData = salesData.filter((sale) => hasLimitedAvailabilityTag(sale));
    salesData = salesData.filter(
        (sale) =>
            sale.inventoryType == 'CHAMPION_SKIN' ||
            sale.inventoryType == 'SUMMONER_ICON' ||
            sale.inventoryType == 'WARD_SKIN' ||
            sale.inventoryType == 'EMOTE',
    );
    salesData = salesData.filter((sale) => {
        const inactiveDate = new Date(sale.inactiveDate!);
        const now = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        return inactiveDate > now && inactiveDate < sixMonthsFromNow;
    });

    return salesData;
}

function minimizeCatalogSale(sales: RawCatalogSale[]): CatalogSaleRecord[] {
    const minimizedSales = sales.map((sale) => {
        const rawStartDate = new Date(sale.sale!.startDate);
        const rawEndDate = new Date(sale.sale!.endDate);

        const priceInfo = getPriceInfo(sale.prices);
        const salePriceInfo = getPriceInfo(sale.sale!.prices);

        rawStartDate.setHours(rawStartDate.getHours() + 6);
        rawEndDate.setHours(rawEndDate.getHours() + 6);
        return {
            RiotItemID: sale.itemId,
            SaleStartAt: rawStartDate,
            SaleEndAt: rawEndDate,
            ItemType: getItemTypeByName(sale.inventoryType),
            NormalPrice: priceInfo.cost,
            SalePrice: salePriceInfo.cost,
            PercentOff: Math.round(salePriceInfo.discount * 100),
            Currency: priceInfo.currency,
            IsActive: sale.active,
            Limited: false,
        };
    });
    return minimizedSales;
}

function minimizeLimitedSale(sales: RawCatalogSale[]): CatalogSaleRecord[] {
    const minimizedSales = sales.map((sale) => {
        const rawStartDate = new Date(sale.releaseDate);
        const rawEndDate = new Date(sale.inactiveDate!);
        const priceInfo = getPriceInfo(sale.prices);

        let salePrice;
        let discount = 0;
        let itemType;

        if (sale.subInventoryType === 'RECOLOR') {
            itemType = getItemTypeByName(sale.subInventoryType);
        } else {
            itemType = getItemTypeByName(sale.inventoryType);
        }

        if (sale.sale) {
            const salePriceInfo = getPriceInfo(sale.sale.prices);
            salePrice = salePriceInfo.cost;
            discount = salePriceInfo.discount;
        } else {
            salePrice = priceInfo.cost;
        }

        rawStartDate.setHours(rawStartDate.getHours() + 6);
        rawEndDate.setHours(rawEndDate.getHours() + 6);
        return {
            RiotItemID: sale.itemId,
            SaleStartAt: rawStartDate,
            SaleEndAt: rawEndDate,
            ItemType: itemType,
            NormalPrice: priceInfo.cost,
            SalePrice: salePrice,
            PercentOff: Math.round(discount * 100),
            Currency: priceInfo.currency,
            IsActive: sale.active,
            Limited: true,
        };
    });
    return minimizedSales;
}

function dedupeSales(sales: CatalogSaleRecord[]) {
    const map = new Map<string, CatalogSaleRecord>();

    for (const sale of sales) {
        const key = `${sale.RiotItemID}-${sale.SaleStartAt.toISOString()}-${sale.SaleEndAt.toISOString()}`;
        if (!map.has(key)) {
            map.set(key, sale);
        }
    }
    return Array.from(map.values());
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
    const limitedSales = getLimitedSales(salesData);

    const minimizedSales = minimizeCatalogSale(filteredSales);
    const minimizedLimitedSales = minimizeLimitedSale(limitedSales);

    return minimizedSales.concat(minimizedLimitedSales);
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
        console.log('Failed Items:', sales);
    } else {
        console.log('Catalog sales upserted successfully.');
    }
}

async function upsertMythicSales(sales: MythicSaleRecord[]) {
    const { error } = await supabase.from('MythicSale').upsert(sales, {
        onConflict: 'SaleStartAt,PrimaryItemID,Section,SaleEndAt',
    });

    if (error) {
        console.error('Error upserting mythic sales:', error);
        console.log('Failed Items:', sales);
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

function getUTCMidnight(date: Date) {
    const result = new Date(date);
    result.setUTCHours(0, 0, 0, 0);
    return result;
}

function getNextRefresh(from: Date) {
    const next = getUTCMidnight(from);
    next.setUTCDate(next.getUTCDate() + 1);
    return next;
}

function getNextRefreshBeforeDefault(
    sales: CatalogSaleRecord[] | MythicSaleRecord[],
) {
    const now = new Date();

    const currentDayUTCMidnight = getUTCMidnight(now);
    const nextDefaultRefresh = getNextRefresh(now);

    console.log(
        currentDayUTCMidnight.toISOString(),
        nextDefaultRefresh.toISOString(),
    );

    let earliest: Date | null = null;

    for (const sale of sales) {
        const saleEnd = sale.SaleEndAt;
        const time = saleEnd.getTime();

        if (
            time > currentDayUTCMidnight.getTime() &&
            time < nextDefaultRefresh.getTime()
        ) {
            if (!earliest || time < earliest.getTime()) {
                earliest = saleEnd;
            }
        }
    }

    return earliest;
}

async function scheduleNextRefresh(nextRefresh: Date) {
    const res = await fetch('http://100.99.1.41:3000/schedule-wake', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            wake_at: nextRefresh.toISOString(),
        }),
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    console.log(await res.json());
}

// main function
async function main() {
    const sales = dedupeSales(processCatalogSales());
    upsertCatalogSales(sales);
    deactivateOldSales('CatalogSale');

    const mythicSales = processMythicSales();
    upsertMythicSales(mythicSales);
    deactivateOldSales('MythicSale');

    const nextCatalogRefresh = getNextRefreshBeforeDefault(sales);
    const nextMythicRefresh = getNextRefreshBeforeDefault(mythicSales);

    console.log('Next Catalog Refresh:', nextCatalogRefresh);
    console.log('Next Mythic Refresh:', nextMythicRefresh);

    const nextRefresh = minDate(nextCatalogRefresh, nextMythicRefresh);
    console.log('Overall Next Refresh:', nextRefresh);

    if (nextRefresh) {
        await scheduleNextRefresh(nextRefresh);
    } else {
        console.log('No upcoming sales found to schedule a refresh.');
    }
}

main();
