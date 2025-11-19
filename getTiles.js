import fs from 'fs'
import path from 'path';

let masterJson = {};

const champJsons = fs.readdirSync('./champs').filter(file => path.extname(file) === '.json');

// saves tile image to ./tiles with the naming convention {champNumber}{skinNumber}.jpg 
function saveTileImage(imagePath, skinNumber) {
    let skinStr = skinNumber.toString()
    const destPath = path.join('./tiles', `${skinStr}.jpg`);
    console.log(`Saving tile image to ${destPath}`);
    fs.copyFileSync(imagePath, destPath);
    return destPath;
}

function getNewImagePath(imagePath) {
    const parts = imagePath.split("Characters/");
    const result = parts[1].toLowerCase();
    const newPath = path.join("assets", result);
    return newPath;
}

// cleans the champ json to only include relevant fields
function cleanChampData(json) {
    const champName = json.name;
    const skins = {};
    json.skins.forEach((skin) => {
        const tilePath = getNewImagePath(skin.tilePath);
        const tileImagePath = saveTileImage(tilePath, skin.id);
        skins[skin.id] = {
            skinName: skin.name,
            tilePath: tileImagePath
        };
    });
    return {
        champName: champName,
        skins: skins
    };
}

champJsons.forEach(file => {
    const fileData = fs.readFileSync(path.join('./champs', file));
    const json = JSON.parse(fileData);
    const cleanedData = cleanChampData(json);
    masterJson[json.id] = cleanedData;
});

fs.writeFileSync(
    'masterChamps.json',
    JSON.stringify(masterJson, null, 2),
    'utf8'
);