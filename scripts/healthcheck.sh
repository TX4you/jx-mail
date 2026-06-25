#!/usr/bin/env bash
set -euo pipefail

# Check if ports are listening using bash /dev/tcp connection
PORTS=(25 465 587 143 993 8080)
ALL_OK=true

echo "Running jx-mail ports healthcheck..."

for PORT in "${PORTS[@]}"; do
    if bash -c "timeout 2 >/dev/null 2>&1 </dev/tcp/127.0.0.1/$PORT"; then
        echo "  [OK] Port $PORT is active"
    else
        # Try checking via localhost inside docker if running on host
        if bash -c "timeout 2 >/dev/null 2>&1 </dev/tcp/localhost/$PORT"; then
            echo "  [OK] Port $PORT is active (localhost)"
        else
            echo "  [ERR] Port $PORT is down"
            ALL_OK=false
        fi
    fi
done

if [ "$ALL_OK" = true ]; then
    echo "Mail server healthcheck PASSED!"
    exit 0
else
    echo "Mail server healthcheck FAILED!"
    exit 1
fi
