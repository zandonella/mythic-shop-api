#!/bin/bash
mkdir -p data/source
mkdir -p data/parsed
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/nexusfinishers.json > data/source/finishers.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-emotes.json > data/source/emotes.json

# Skins
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skins.json > data/source/skins.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skinlines.json > data/source/skinlines.json

# Icons
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-icons.json > data/source/icons.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-icon-sets.json > data/source/iconSets.json
# ./snip-snip.exe https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/ --filter splash_tile -o assets/characters