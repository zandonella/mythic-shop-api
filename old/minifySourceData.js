import fs from 'fs';
import { createCDNImageUrl } from '../lib/images.js';

// skins
const skinJsonData = fs.readFileSync('data/source/skins.json', 'utf8');
const inputSkins = JSON.parse(skinJsonData);
const skinsArray = Object.values(inputSkins);

// skinlines
const skinlineJsonData = fs.readFileSync('data/source/skinlines.json', 'utf8');
const skinlines = JSON.parse(skinlineJsonData);
const skinlineDictionary = skinlines.reduce((acc, line) => {
    acc[line.id] = line;
    return acc;
}, {});

// emotes
const emoteJsonData = fs.readFileSync('data/source/emotes.json', 'utf8');
const inputEmotes = JSON.parse(emoteJsonData);

// icons
const iconJsonData = fs.readFileSync('data/source/icons.json', 'utf8');
const inputIcons = JSON.parse(iconJsonData);

function getSkinlineNameById(id) {
    const skinline = skinlineDictionary[id];
    return skinline ? skinline.name : null;
}

function parseSkins(skins) {
    // map data to only include relevant fields
    skins = skins.map((skin) => ({
        id: skin.id,
        name: skin.name,
        skinline: skin.skinLines
            ? getSkinlineNameById(skin.skinLines[0].id)
            : null,
        tilePath: createCDNImageUrl(skin.tilePath),
    }));

    return skins;
}

function parseEmotes(emotes) {
    // map data to only include relevant fields
    emotes = emotes.map((emote) => ({
        id: emote.id,
        name: emote.name,
        iconPath: createCDNImageUrl(emote.inventoryIcon),
    }));

    return emotes;
}

function parseIcons(icons) {
    // map data to only include relevant fields
    icons = icons.map((icon) => ({
        id: icon.id,
        name: icon.title,
        iconPath: createCDNImageUrl(icon.imagePath),
    }));

    return icons;
}

const parsedSkins = parseSkins(skinsArray);
fs.writeFileSync(
    'data/parsed/skins.json',
    JSON.stringify(parsedSkins, null, 4),
    'utf8',
);

const parsedEmotes = parseEmotes(inputEmotes);
fs.writeFileSync(
    'data/parsed/emotes.json',
    JSON.stringify(parsedEmotes, null, 4),
    'utf8',
);

const parsedIcons = parseIcons(inputIcons);
fs.writeFileSync(
    'data/parsed/icons.json',
    JSON.stringify(parsedIcons, null, 4),
    'utf8',
);
