// imported data types
export type RawSkin = {
    id: number;
    contentId: string;
    isBase: boolean;
    name: string;
    tilePath: string;
    skinLines?: Array<{ id: number }> | null;
    chromas?: RawChroma[] | null;
};

export type RawChampion = {
    id: number;
    name: string;
    alias: string;
    squarePortraitPath: string;
};

export type RawSkinline = {
    id: number;
    name: string;
};

export type RawChroma = {
    id: number;
    name: string;
    tilePath: string;
    contentId: string;
};

export type RawFinisher = {
    itemId: number;
    translatedName: string;
    iconPath: string;
    contentId: string;
};

export type RawSkinsById = Record<string, RawSkin>;

export type RawCatalogSale = {
    active: boolean;
    inventoryType: string;
    itemId: number;
    prices: [
        {
            cost: number;
            currency: string;
        },
    ];
    sale: {
        endDate: Date;
        prices: [
            {
                cost: number;
                currency: string;
                discount: number;
            },
        ];
        startDate: Date;
    } | null;
    subInventoryType: string;
};

export type RawMythicSale = {
    startTime: string;
    endTime: string;
    catalogEntries: Array<{
        displayMetadata: {
            type?: string;
            shoppefront?: {
                bundleType?: string;
            };
        };
        name: string;
        id: string;
        endTime: string;
        purchaseUnits: Array<{
            fulfillment: {
                itemId: string;
                name: string;
            };
            paymentOptions?: Array<{
                payments: Array<{
                    finalDelta: number;
                    name: string;
                }>;
            }>;
        }>;
    }>;
    displayMetadata: {
        shoppefront: {
            categories: string[];
        };
    };
};

export type RawIcon = {
    id: number;
    contentId: string;
    title: string;
    imagePath: string;
};

export type RawWard = {
    id: number;
    contentId: string;
    name: string;
    wardImagePath: string;
};

export type RawEmote = {
    id: number;
    contentId: string;
    name: string;
    inventoryIcon: string;
};

// database types
export type CatalogItemRecord = {
    ItemID: string;
    ItemType: number;
    RiotItemID: number;
    ChampionID: number | null;
    Name: string;
    SkinlineID: number | null;
    ImageURL: string;
};

export type CatalogSaleRecord = {
    RiotItemID: number;
    SaleStartAt: Date;
    SaleEndAt: Date;
    ItemType: number;
    NormalPrice: number;
    SalePrice: number;
    PercentOff: number;
    Currency: string;
    IsActive: boolean;
};

export type sectionType = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'FEATURED';

export type MythicSaleRecord = {
    OfferID: string;
    SaleStartAt: Date;

    PrimaryItemID: string;
    SaleEndAt: Date;
    Price: number;
    Currency: string;
    IsActive: boolean;
    Section: sectionType;

    IsBundle: boolean;
    IncludedItems: string[];
    BundleType: string | null;
};

export type ChampionRecord = {
    id: number;
    Slug: string;
    Name: string;
    ImageURL: string;
};

export type SkinlineRecord = {
    id: number;
    Name: string;
};
