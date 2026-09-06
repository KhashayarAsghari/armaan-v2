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

# shellcheck disable=SC1091
set -a; source .env; set +a

DOMAIN="${DOMAIN:?set DOMAIN in .env, e.g. example.com}"
EMAIL="${CERTBOT_EMAIL:?set CERTBOT_EMAIL in .env (used for Let's Encrypt expiry notices)}"
STAGING="${CERTBOT_STAGING:-0}" # set to 1 in .env first to test against LE's staging server (no rate limits)

COMPOSE="docker compose"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"

echo "== Bootstrapping TLS certificate for: $DOMAIN =="

echo "-- Creating dummy self-signed certificate so nginx can start..."
$COMPOSE run --rm --entrypoint "\
  sh -c 'mkdir -p $CERT_PATH && \
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout $CERT_PATH/privkey.pem \
    -out $CERT_PATH/fullchain.pem \
    -subj \"/CN=$DOMAIN\"'" certbot

echo "-- Starting nginx with the dummy certificate..."
$COMPOSE up -d nginx

echo "-- Deleting dummy certificate..."
$COMPOSE run --rm --entrypoint "sh -c 'rm -rf $CERT_PATH'" certbot

echo "-- Requesting real certificate from Let's Encrypt..."
staging_arg=""
if [ "$STAGING" != "0" ]; then
  staging_arg="--staging"
  echo "   (using Let's Encrypt STAGING environment — certificate will not be trusted by browsers)"
fi

$COMPOSE run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 2048 \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

echo "-- Reloading nginx with the real certificate..."
$COMPOSE exec nginx nginx -s reload

echo "== Done. https://$DOMAIN should now serve a valid certificate. =="
echo "   Renewal happens automatically via the 'certbot' service in docker-compose.yml."
