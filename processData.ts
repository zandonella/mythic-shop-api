import {
    createCDNImageUrl,
    getChampionNameFromImagePath,
} from './lib/images.ts';
import { supabase } from './lib/supabase.ts';
import type {
    CatalogItemRecord,
    SkinSaleRecord,
    MythicSaleRecord,
    RawSkinsById,
    RawSkin,
    RawChampion,
    RawSkinline,
    ChampionRecord,
    SkinlineRecord,
    RawFinisher,
} from './lib/types.ts';
import fs from 'fs';

const skinlineJsonData = fs.readFileSync('data/source/skinlines.json', 'utf8');
const skinlines: RawSkinline[] = JSON.parse(skinlineJsonData);

const championJsonData = fs.readFileSync(
    'data/source/champion-summary.json',
    'utf8',
);
const champions: RawChampion[] = JSON.parse(championJsonData);

// helpers
function normalizeChampionKey(key: string): string {
    return key.trim().toLowerCase();
}

function ChampionDictionary(): Map<string, number> {
    const championDictionary = new Map<string, number>();
    for (const champ of champions) {
        if (champ.id < 0) continue;
        championDictionary.set(normalizeChampionKey(champ.alias), champ.id);
    }

    return championDictionary;
}

// processing functions
function processChampions(): ChampionRecord[] {
    const reducedChamps = champions
        .filter((champ) => champ.id < 66600 && champ.id > 0)
        .map((champ) => ({
            id: champ.id,
            Slug: champ.alias,
            Name: champ.name,
            ImageURL: createCDNImageUrl(champ.squarePortraitPath),
        }));
    return reducedChamps;
}

function processSkinlines(): SkinlineRecord[] {
    const reducedSkinlines = skinlines
        .filter((skinline) => skinline.id > 0)
        .map((skinline) => ({
            id: skinline.id,
            Name: skinline.name,
        }));
    return reducedSkinlines;
}

function processFinishers(): CatalogItemRecord[] {
    const jsonData = fs.readFileSync('data/source/finishers.json', 'utf8');
    const finisherJson: RawFinisher[] = JSON.parse(jsonData);
    const finishers: CatalogItemRecord[] = finisherJson.map((finisher) => ({
        ItemType: 5,
        RiotItemID: finisher.itemId,
        Name: finisher.translatedName,
        ChampionID: null,
        SkinlineID: null,
        ImageURL: createCDNImageUrl(finisher.iconPath),
    }));
    return finishers;
}

function processSkins(ChampionDict: Map<string, number>): CatalogItemRecord[] {
    const jsonData = fs.readFileSync('data/source/skins.json', 'utf8');

    const skinJson: RawSkinsById = JSON.parse(jsonData);
    const skins: RawSkin[] = Object.values(skinJson);

    const reducedSkins: CatalogItemRecord[] = skins.flatMap((skin: RawSkin) => {
        if (skin.isBase) {
            return [];
        }

        const champion = getChampionNameFromImagePath(skin.tilePath);
        if (!champion) {
            console.warn(
                `Could not determine champion for skin: ${skin.name} (ID: ${skin.id})`,
            );
            return [];
        }

        const championID = ChampionDict.get(normalizeChampionKey(champion));
        if (!championID) {
            console.warn(
                `Could not determine champion ID for skin: ${skin.name} (ID: ${skin.id})`,
            );
            return [];
        }

        const baseImageUrl = createCDNImageUrl(skin.tilePath);
        if (!baseImageUrl) {
            console.warn(
                `Could not create image URL for skin: ${skin.name} (ID: ${skin.id})`,
            );
            return [];
        }

        const skinlineId = skin.skinLines ? skin.skinLines[0]?.id : null;

        const baseSkin: CatalogItemRecord = {
            ItemType: 1,
            RiotItemID: skin.id,
            Name: skin.name,
            ChampionID: championID,
            SkinlineID: skinlineId,
            ImageURL: baseImageUrl,
        };

        const chromas: CatalogItemRecord[] = [];

        if (skin.chromas && skin.chromas.length > 0) {
            for (const chroma of skin.chromas) {
                const chromaURL = createCDNImageUrl(chroma.tilePath);
                if (!chromaURL) {
                    console.warn(
                        `Could not create image URL for chroma: ${chroma.id} of skin: ${skin.name} (ID: ${skin.id})`,
                    );
                    continue;
                }

                const chromaSkin: CatalogItemRecord = {
                    ItemType: 2,
                    RiotItemID: chroma.id,
                    Name: chroma.name,
                    ChampionID: championID,
                    SkinlineID: skinlineId,
                    ImageURL: chromaURL,
                };

                chromas.push(chromaSkin);
            }
        }

        return [baseSkin, ...chromas];
    });

    return reducedSkins;
}

async function upsertCatalogItems(items: CatalogItemRecord[]) {
    const { error } = await supabase
        .from('CatalogItem')
        .upsert(items, { onConflict: 'ItemType,RiotItemID' });

    if (error) {
        console.error('Error inserting catalog items:', error);
    } else {
        console.log(`Inserted/Updated catalog items successfully.`);
    }
}

async function upsertChampionData(champions: ChampionRecord[]) {
    const { error } = await supabase
        .from('Champion')
        .upsert(champions, { onConflict: 'id' });
    if (error) {
        console.error('Error inserting champion data:', error);
    } else {
        console.log(`Inserted/Updated champion data successfully.`);
    }
}

async function upsertSkinlineData(skinlines: SkinlineRecord[]) {
    const { error } = await supabase
        .from('Skinline')
        .upsert(skinlines, { onConflict: 'id' });
    if (error) {
        console.error('Error inserting skinline data:', error);
    } else {
        console.log(`Inserted/Updated skinline data successfully.`);
    }
}

async function main() {
    const ChampionDict = ChampionDictionary();

    const processedChampions = processChampions();
    await upsertChampionData(processedChampions);

    const processedSkinlines = processSkinlines();
    await upsertSkinlineData(processedSkinlines);

    const processedSkins = processSkins(ChampionDict);
    await upsertCatalogItems(processedSkins);

    const processedFinishers = processFinishers();
    await upsertCatalogItems(processedFinishers);
}
main();
