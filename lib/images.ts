const COMMUNITY_DRAGON_BASE_URL =
    'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default';

function getCommunityDragonUrl(imagePath: string): string | null {
    if (!imagePath) return null;

    const prefix = '/lol-game-data/assets/';
    if (!imagePath.startsWith(prefix)) return null;

    const relative = imagePath.slice(prefix.length);
    const lowered = relative.toLowerCase();

    return `${COMMUNITY_DRAGON_BASE_URL}/${lowered}`;
}

export function getChampionNameFromImagePath(imagePath: string): string | null {
    const match = imagePath.match(/\/Characters\/([^/]+)\//);
    return match ? match[1] : null;
}

export function createCDNImageUrl(imagePath: string): string {
    const cdnBaseUrl = '//wsrv.nl/?url=';
    const cdnImagePath = getCommunityDragonUrl(imagePath);

    return `${cdnBaseUrl}${cdnImagePath}`;
}

// const testEmote =
//     '/lol-game-data/assets/ASSETS/Loadouts/SummonerEmotes/TFT/StandardRewards/4422_The_Boss_Inventory.png';
// const testTile =
//     '/lol-game-data/assets/ASSETS/Characters/Annie/Skins/Skin01/Images/annie_splash_tile_1.jpg';
// const testIcon = '/lol-game-data/assets/v1/profile-icons/5164.jpg';

// console.log(getCommunityDragonUrl(testEmote));
// console.log(getCommunityDragonUrl(testTile));
// console.log(getCommunityDragonUrl(testIcon));

// console.log(createCDNImageUrl(testTile));
