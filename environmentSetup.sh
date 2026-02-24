#!/bin/bash
cd "C:\Users\zando\Desktop\mythic-shop-api"

mkdir -p data/source
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/nexusfinishers.json > data/source/finishers.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-emotes.json > data/source/emotes.json


# Skins
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skins.json > data/source/skins.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skinlines.json > data/source/skinlines.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json > data/source/champion-summary.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/universes.json > data/source/universes.json

# Icons
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-icons.json > data/source/icons.json

# Wards
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/ward-skins.json > data/source/wards.json

node processStaticData.ts
