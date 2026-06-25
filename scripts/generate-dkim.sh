#!/usr/bin/env bash
set -euo pipefail

# Scripts directory
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
MAIL_DIR="$(dirname "$DIR")"

# Load .env if exists
if [ -f "$MAIL_DIR/.env" ]; then
    export $(grep -v '^#' "$MAIL_DIR/.env" | xargs)
fi

SELECTOR="${DKIM_SELECTOR:-mail}"
DOMAIN="${MAIL_DOMAIN:-jurixis.com.br}"
OUT_DIR="$MAIL_DIR/mail/dkim"

mkdir -p "$OUT_DIR"

echo "Generating DKIM keys for selector '$SELECTOR' and domain '$DOMAIN'..."
openssl genrsa -out "$OUT_DIR/$SELECTOR.private" 2048
openssl rsa -in "$OUT_DIR/$SELECTOR.private" -pubout -outform PEM -out "$OUT_DIR/$SELECTOR.public"

# Format the public key to fit in a single line without headers
PUB_KEY_CONTENT=$(grep -v '^-' "$OUT_DIR/$SELECTOR.public" | tr -d '\n')

echo "------------------------------------------------------------"
echo "DKIM Keys generated successfully in $OUT_DIR"
echo "------------------------------------------------------------"
echo "DNS Record Name (TXT):"
echo "$SELECTOR._domainkey.$DOMAIN"
echo ""
echo "DNS Record Value:"
echo "v=DKIM1; k=rsa; p=$PUB_KEY_CONTENT"
echo "------------------------------------------------------------"
