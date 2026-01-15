import {
    createCDNImageUrl,
    getChampionNameFromImagePath,
} from './lib/images.js';
import { supabase } from './lib/supabase.ts';
import type {
    CatalogItemRecord,
    SkinSaleRecord,
    MythicSaleRecord,
    RawSkinsById,
    RawSkin,
} from './lib/types.ts';
import fs from 'fs';

const skinlineJsonData = fs.readFileSync('data/source/skinlines.json', 'utf8');
const skinlines = JSON.parse(skinlineJsonData);
const skinlineDictionary = skinlines.reduce((acc: any, line: any) => {
    acc[line.id] = line;
    return acc;
}, {});

function getSkinlineNameById(id: number): string | null {
    const skinline = skinlineDictionary[id];
    return skinline ? skinline.name : null;
}

function processSkins(): CatalogItemRecord[] {
    const jsonData = fs.readFileSync('data/source/skins.json', 'utf8');

    const skinJson: RawSkinsById = JSON.parse(jsonData);
    const skins: RawSkin[] = Object.values(skinJson);

    const reducedSkins: CatalogItemRecord[] = skins.flatMap((skin: RawSkin) => {
        if (skin.isBase) {
            return [];
        }

        const champion = getChampionNameFromImagePath(skin.tilePath);

        const skinlineId = skin.skinLines ? skin.skinLines[0]?.id : null;
        const skinlineName = skinlineId
            ? getSkinlineNameById(skinlineId)
            : null;

        const baseSkin: CatalogItemRecord = {
            ItemType: 'Skin',
            RiotItemID: String(skin.id),
            Name: skin.name,
            Champion: champion,
            Skinline: skinlineName,
            ImageURL: createCDNImageUrl(skin.tilePath),
        };

        const chromas: CatalogItemRecord[] =
            skin.chromas?.map((chroma) => ({
                ItemType: 'Chroma',
                RiotItemID: String(chroma.id),
                Name: chroma.name,
                Champion: champion,
                Skinline: skinlineName,
                ImageURL: createCDNImageUrl(chroma.tilePath),
            })) ?? [];

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

async function main() {
    const processedSkins = processSkins();
    await upsertCatalogItems(processedSkins);
}
main();
