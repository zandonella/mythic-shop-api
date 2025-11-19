#!/bin/bash
mkdir tiles
cd-dd -o ./champs https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/


max_attempts=5
attempt_num=1

while true; do
    cd-dd -r -o ./assets 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/'
    exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo "Command succeeded!"
        break
    else
        if [ $attempt_num -eq $max_attempts ]; then
            echo "All $max_attempts attempts failed. Exiting."
            exit 1
        fi
        delay=$((attempt_num * 5 + RANDOM % 3)) # Backoff + jitter
        echo "Attempt $attempt_num failed. Retrying in $delay seconds..."
        sleep $delay
        attempt_num=$((attempt_num + 1))
    fi
done