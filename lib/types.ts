// imported data types
export type RawSkin = {
    id: number;
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
};

export type RawFinisher = {
    itemId: number;
    translatedName: string;
    iconPath: string;
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

// database types
export type CatalogItemRecord = {
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
    IsActive: boolean;
};

export type MythicSaleRecord = {
    RiotItemID: string;
    SaleStartAt: string;
    SaleEndAt: string;
    NormalPrice: number;
    SalePrice: number;
    PercentOff: number;
    IsActive: boolean;
    Section: 'Daily' | 'Weekly' | 'Biweekly' | 'Featured';
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
