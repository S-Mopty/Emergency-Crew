#!/bin/bash
# ============================================================
#  Emergency Crew - VPS First-Time Setup
#  Run on the VPS: sudo bash setup.sh
# ============================================================
set -e

DOMAIN="emergencycrew.synn.fr"
APP_DIR="/opt/emergency-crew"

echo "=== Emergency Crew VPS Setup ==="

# 1. System update
echo "[1/7] Updating system..."
apt update && apt upgrade -y

# 2. Install Node.js 22
echo "[2/7] Installing Node.js 22..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 22 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
fi
echo "Node version: $(node -v)"

# 3. Install Nginx
echo "[3/7] Installing Nginx..."
apt install -y nginx

# 4. Install Certbot
echo "[4/7] Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# 5. Create app user and directory
echo "[5/7] Setting up app directory..."
id -u gameserver &>/dev/null || useradd -r -s /bin/false gameserver
mkdir -p "$APP_DIR"
chown gameserver:gameserver "$APP_DIR"

# 6. Configure Nginx
echo "[6/7] Configuring Nginx..."
cp "$(dirname "$0")/nginx.conf" /etc/nginx/sites-available/emergency-crew
ln -sf /etc/nginx/sites-available/emergency-crew /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 7. SSL Certificate
echo "[7/7] Obtaining SSL certificate..."
echo ""
echo "IMPORTANT: Make sure DNS A record for $DOMAIN points to this server's IP."
echo ""
read -p "DNS is configured? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@synn.fr
else
    echo "Skipping SSL. Run later: certbot --nginx -d $DOMAIN"
fi

# Install systemd service
cp "$(dirname "$0")/emergency-crew.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable emergency-crew

echo ""
echo "=== Setup complete ==="
echo "Next steps:"
echo "  1. Run deploy.sh from your local machine to upload the code"
echo "  2. Access https://$DOMAIN"
