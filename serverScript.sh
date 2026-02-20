#!/bin/bash
set -euo pipefail

cd "C:\Users\zando\Desktop\mythic-shop-api"

# Launch Riot Client
RIOT_EXE='/c/Riot Games/Riot Client/RiotClientServices.exe'
"$RIOT_EXE" --launch-product=league_of_legends --launch-patchline=live &

max_attempts=3
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
    RIOT_EXE='/c/Riot Games/Riot Client/RiotClientServices.exe'
    "$RIOT_EXE" --launch-product=league_of_legends --launch-patchline=live &
    ((attempt++))
done

if (( attempt > max_attempts )); then
    echo "Failed to retrieve client data after $max_attempts attempts. Exiting."
    exit 1
fi

node processClientData.ts

echo "All tasks completed successfully."
exit 0

