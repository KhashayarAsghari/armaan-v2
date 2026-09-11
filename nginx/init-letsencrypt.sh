#!/usr/bin/env bash
# One-time bootstrap for the Let's Encrypt certificate.
#
# Why this script exists: nginx's HTTPS server block refuses to start without
# an existing certificate file, but Certbot needs nginx running (to answer the
# HTTP-01 challenge) to *issue* that certificate in the first place. This
# script breaks the chicken-and-egg problem by staging a temporary
# self-signed "dummy" certificate first, starting nginx, requesting the real
# certificate from Certbot, then reloading nginx with it.
#
# Run this once per domain, from the project root, before `docker compose up`:
#   ./nginx/init-letsencrypt.sh
#
# Safe to re-run — it skips issuance if a real certificate already exists.

set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Error: .env not found. Copy .env.example to .env and fill it in first." >&2
  exit 1
fi

# Deliberately NOT `source .env` here: that file has unquoted values with
# spaces (e.g. NEXT_PUBLIC_COMPANY_ADDRESS), which bash would try to execute
# as commands. Instead, pull out just the three keys this script needs.
DOMAIN="$(grep -E '^DOMAIN=' .env | tail -1 | cut -d '=' -f2- | sed -e 's/^"//' -e 's/"$//')"
EMAIL="$(grep -E '^CERTBOT_EMAIL=' .env | tail -1 | cut -d '=' -f2- | sed -e 's/^"//' -e 's/"$//')"
STAGING="$(grep -E '^CERTBOT_STAGING=' .env | tail -1 | cut -d '=' -f2- | sed -e 's/^"//' -e 's/"$//')"
STAGING="${STAGING:-0}"

: "${DOMAIN:?set DOMAIN in .env, e.g. example.com}"
: "${EMAIL:?set CERTBOT_EMAIL in .env, used for certificate expiry notices}"

COMPOSE="docker compose"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"

echo "== Bootstrapping TLS certificate for: $DOMAIN =="

echo "-- Creating dummy self-signed certificate so nginx can start..."
$COMPOSE run --rm --entrypoint sh certbot -c \
  "mkdir -p '$CERT_PATH' && openssl req -x509 -nodes -newkey rsa:2048 -days 1 -keyout '$CERT_PATH/privkey.pem' -out '$CERT_PATH/fullchain.pem' -subj '/CN=$DOMAIN'"

echo "-- Starting nginx with the dummy certificate..."
$COMPOSE up -d nginx

echo "-- Deleting dummy certificate..."
$COMPOSE run --rm --entrypoint sh certbot -c "rm -rf '$CERT_PATH'"

echo "-- Requesting real certificate from Let's Encrypt..."
staging_arg=""
if [ "$STAGING" != "0" ]; then
  staging_arg="--staging"
  echo "   (using Let's Encrypt STAGING environment — certificate will not be trusted by browsers)"
fi

# No --entrypoint/sh -c needed here — the certbot image's default entrypoint
# already IS the certbot binary, so args are passed straight through.
$COMPOSE run --rm certbot certonly --webroot -w /var/www/certbot \
  $staging_arg \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  --rsa-key-size 2048 \
  --agree-tos \
  --no-eff-email \
  --force-renewal

echo "-- Reloading nginx with the real certificate..."
$COMPOSE exec nginx nginx -s reload

echo "== Done. https://$DOMAIN should now serve a valid certificate. =="
echo "   Renewal happens automatically via the 'certbot' service in docker-compose.yml."
