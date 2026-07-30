#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

RIOT_EXE='/c/Riot Games/Riot Client/RiotClientServices.exe'
RIOT_LAUNCH_TIMEOUT_SECONDS="${RIOT_LAUNCH_TIMEOUT_SECONDS:-300}"

launch_league() {
    local local_app_data
    local lockfile
    local deadline
    local lock_name
    local riot_pid
    local riot_port
    local riot_password
    local riot_protocol
    local eligibility
    local launch_url

    if [[ -z "${LOCALAPPDATA:-}" ]]; then
        echo "LOCALAPPDATA is not set, so the Riot Client lockfile cannot be located."
        return 1
    fi

    local_app_data="$(cygpath -u "$LOCALAPPDATA")"
    lockfile="$local_app_data/Riot Games/Riot Client/Config/lockfile"

    # Riot's direct-launch arguments can now be disabled by a client feature flag.
    # Start Riot Client normally, then use the same local request as its Play button.
    "$RIOT_EXE" &
    deadline=$((SECONDS + RIOT_LAUNCH_TIMEOUT_SECONDS))

    while (( SECONDS < deadline )); do
        if [[ -s "$lockfile" ]]; then
            IFS=: read -r lock_name riot_pid riot_port riot_password riot_protocol < "$lockfile" || true

            if [[ -n "$riot_port" && -n "$riot_password" ]]; then
                eligibility="$(
                    curl --silent --show-error --insecure \
                        --connect-timeout 2 \
                        --max-time 5 \
                        --user "riot:$riot_password" \
                        "https://127.0.0.1:$riot_port/product-launcher/v1/products/league_of_legends/patchlines/live/eligibility" \
                        2>/dev/null || true
                )"

                if [[ "$eligibility" == "true" ]]; then
                    launch_url="https://127.0.0.1:$riot_port/product-launcher/v1/products/league_of_legends/patchlines/live"
                    if curl --fail --silent --show-error --insecure \
                        --connect-timeout 2 \
                        --max-time 10 \
                        --user "riot:$riot_password" \
                        --request POST \
                        "$launch_url" \
                        >/dev/null; then
                        echo "League launch requested through Riot Client."
                        return 0
                    fi
                fi
            fi
        fi

        sleep 2
    done

    echo "Riot Client did not become ready to launch League within $RIOT_LAUNCH_TIMEOUT_SECONDS seconds."
    return 1
}

if ! launch_league; then
    exit 1
fi

if [[ "${RIOT_LAUNCH_ONLY:-false}" == "true" ]]; then
    echo "Launch-only test completed successfully."
    exit 0
fi

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
    if ! launch_league; then
        exit 1
    fi
    ((attempt++))
done

if (( attempt > max_attempts )); then
    echo "Failed to retrieve client data after $max_attempts attempts. Exiting."
    exit 1
fi

node processClientData.ts

echo "All tasks completed successfully."
exit 0

