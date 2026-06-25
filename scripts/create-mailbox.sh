#!/usr/bin/env bash
set -euo pipefail

# Scripts directory
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
MAIL_DIR="$(dirname "$DIR")"

# Load .env if exists
if [ -f "$MAIL_DIR/.env" ]; then
    # Load env, ignoring comments
    export $(grep -v '^#' "$MAIL_DIR/.env" | xargs)
fi

ADMIN_PASS="${ADMIN_PASSWORD:-admin-secure-password-2026}"
DEFAULT_DOMAIN="${MAIL_DOMAIN:-jurixis.com.br}"

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <username>[@domain] [password]"
    echo "Example: $0 alice@jurixis.com.br SuperSecretPass123"
    exit 1
fi

EMAIL="$1"
PASSWORD="${2:-}"

# Extract username and domain
if [[ "$EMAIL" == *"@"* ]]; then
    USERNAME="${EMAIL%%@*}"
    DOMAIN="${EMAIL#*@}"
else
    USERNAME="$EMAIL"
    DOMAIN="$DEFAULT_DOMAIN"
fi

# Generate random password if not provided
if [ -z "$PASSWORD" ]; then
    PASSWORD=$(openssl rand -base64 12 | tr -d '/+=')
    echo "No password provided. Generated temporary password: $PASSWORD"
fi

echo "Creating mailbox ${USERNAME}@${DOMAIN} on mail server..."

# JMAP request payload
PAYLOAD=$(cat <<EOF
{
  "using": [
    "urn:ietf:params:jmap:core",
    "urn:stalwart:jmap"
  ],
  "methodCalls": [
    [
      "x:Account/set",
      {
        "create": {
          "new_user": {
            "@type": "User",
            "name": "${USERNAME}",
            "domainId": "${DOMAIN}",
            "credentials": [
              {
                "@type": "Password",
                "secret": "${PASSWORD}"
              }
            ],
            "roles": [
              "User"
            ],
            "quotas": {
              "maxDiskQuota": 1073741824
            }
          }
        }
      },
      "c1"
    ]
  ]
}
EOF
)

# Call Stalwart JMAP endpoint (using basic auth admin:<password> on local port 8080)
RESPONSE=$(curl -s -u "admin:${ADMIN_PASS}" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:8080/jmap \
  -d "$PAYLOAD")

# Check if there is an error in JMAP response
if echo "$RESPONSE" | grep -q "error"; then
    echo "Error creating mailbox: $RESPONSE"
    exit 1
fi

echo "Mailbox ${USERNAME}@${DOMAIN} created successfully!"
echo "Credentials:"
echo "  Email: ${USERNAME}@${DOMAIN}"
echo "  Password: ${PASSWORD}"
echo "  IMAP Server: mail.${DOMAIN} (port 993, SSL/TLS)"
echo "  SMTP Server: mail.${DOMAIN} (port 465, SSL/TLS, or 587, STARTTLS)"
