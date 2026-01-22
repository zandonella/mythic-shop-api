#!/bin/bash
set -euo pipefail

# Launch Riot Client
RIOT_EXE='C:\Riot Games\Riot Client\RiotClientServices.exe'
"$RIOT_EXE" --launch-product=league_of_legends --launch-patchline=live &

mkdir -p data/source
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/nexusfinishers.json > data/source/finishers.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-emotes.json > data/source/emotes.json


# Skins
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skins.json > data/source/skins.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skinlines.json > data/source/skinlines.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json > data/source/champion-summary.json


# Icons
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-icons.json > data/source/icons.json
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-icon-sets.json > data/source/iconSets.json

node processStaticData.ts

max_attempts=6
attempt=1

while (( attempt <= max_attempts )); do
    echo "Attempt $attempt to get client data..."
    set +e
    node getClientData.js
    exit_code=$?
    set -e
    case $exit_code in
        0)
            echo "Client data retrieved successfully."
            break
            ;;
        20)
            echo "Client did not load, likely updating. Retrying..."
            ;;
        21)
            echo "Stores did not load within the expected time. Retrying..."
            ;;
        *)
            echo "Unexpected error (code $exit_code). Exiting."
            exit $exit_code
            ;;
    esac
    ((attempt++))
done

if (( attempt > max_attempts )); then
    echo "Failed to retrieve client data after $max_attempts attempts. Exiting."
    exit 1
fi

node processClientData.ts

