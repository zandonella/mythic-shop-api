// imported data types
export type RawSkin = {
    id: number;
    isBase: boolean;
    name: string;
    tilePath: string;
    skinLines?: Array<{ id: number }> | null;
    chromas?: RawChroma[] | null;
};

export type RawChroma = {
    id: number;
    name: string;
    tilePath: string;
};

export type RawSkinsById = Record<string, RawSkin>;

// database types
export type CatalogItemRecord = {
    ItemType: string;
    RiotItemID: string;
    Champion: string | null;
    Name: string;
    Skinline: string | null;
    ImageURL: string;
};

// look these up by RiotItemID?
export type SkinSaleRecord = {
    ItemID: string;
    SaleStartAt: string;
    SaleEndAt: string;
    NormalPrice: number;
    SalePrice: number;
    PercentOff: number;
    isActive: boolean;
};

export type MythicSaleRecord = {
    ItemID: string;
    SaleStartAt: string;
    SaleEndAt: string;
    NormalPrice: number;
    SalePrice: number;
    PercentOff: number;
    isActive: boolean;
    Section: 'Daily' | 'Weekly' | 'Biweekly' | 'Featured';
};
