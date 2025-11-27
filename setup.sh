#!/bin/bash
mkdir -p assets/sourceData
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/nexusfinishers.json > assets/sourceData/finishers.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-emotes.json > assets/sourceData/emotes.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skins.json > assets/sourceData/skins.json


./snip-snip.exe https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/ --filter splash_tile -o assets/characters