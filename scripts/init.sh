#!/usr/bin/env bash
set -euo pipefail

# Scripts directory
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
MAIL_DIR="$(dirname "$DIR")"

echo "============================================================"
echo "Initializing Jurixis Mail Server (jx-mail)..."
echo "============================================================"

# 1. Prepare environment file
if [ ! -f "$MAIL_DIR/.env" ]; then
    echo "Creating .env file from .env.example..."
    cp "$MAIL_DIR/.env.example" "$MAIL_DIR/.env"
    echo "Please configure the variables in $MAIL_DIR/.env and restart if needed."
fi

# Load variables
export $(grep -v '^#' "$MAIL_DIR/.env" | xargs)

# 2. Make scripts executable
chmod +x "$DIR"/*.sh

# 3. Create persistent directories
mkdir -p "$MAIL_DIR/data/stalwart"
mkdir -p "$MAIL_DIR/mail/stalwart"
mkdir -p "$MAIL_DIR/mail/dkim"

# 4. Generate DKIM keys if not present
SELECTOR="${DKIM_SELECTOR:-mail}"
if [ ! -f "$MAIL_DIR/mail/dkim/$SELECTOR.private" ]; then
    "$DIR/generate-dkim.sh"
else
    echo "DKIM keys already exist."
fi

# 5. Start containers
echo "Starting Docker containers..."
cd "$MAIL_DIR"
docker compose up -d --build

# 6. Wait for Stalwart to become healthy
echo "Waiting for Stalwart Mail Server to start..."
MAX_ATTEMPTS=30
ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:8080/health &>/dev/null; then
        echo "Stalwart Mail Server is up and running!"
        break
    fi
    echo "  Waiting... ($ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
    ATTEMPT=$((ATTEMPT+1))
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    echo "Error: Stalwart Mail Server failed to start in time. Check docker logs."
    exit 1
fi

# 7. Configure default domain
echo "Configuring primary domain '$MAIL_DOMAIN'..."
DOMAIN_PAYLOAD=$(cat <<EOF
{
  "using": [
    "urn:ietf:params:jmap:core",
    "urn:stalwart:jmap"
  ],
  "methodCalls": [
    [
      "x:Domain/set",
      {
        "create": {
          "primary": {
            "name": "${MAIL_DOMAIN}"
          }
        }
      },
      "c1"
    ]
  ]
}
EOF
)

curl -s -u "admin:$ADMIN_PASSWORD" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:8080/jmap \
  -d "$DOMAIN_PAYLOAD" > /dev/null

# 8. Configure default admin user
ADMIN_USER="${ADMIN_EMAIL%%@*}"
echo "Creating default administrator mailbox '$ADMIN_EMAIL'..."
"$DIR/create-mailbox.sh" "$ADMIN_EMAIL" "$ADMIN_PASSWORD"

echo "============================================================"
echo "Initialization Completed successfully!"
echo "You can access the administrative panel at: http://localhost:$PANEL_PORT"
echo "============================================================"
