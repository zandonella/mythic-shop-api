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

export type RawSkinsById = Record<string, RawSkin>;

// database types
export type CatalogItemRecord = {
    ItemType: number;
    RiotItemID: string;
    ChampionID: number | null;
    Name: string;
    SkinlineID: number | null;
    ImageURL: string;
};

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
