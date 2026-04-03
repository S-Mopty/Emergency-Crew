#!/bin/bash
# ============================================================
#  Emergency Crew - Deploy to VPS
#  Run from the project root: bash deploy/deploy.sh
# ============================================================
set -e

VPS_HOST="emergencycrew.synn.fr"
VPS_USER="root"
APP_DIR="/opt/emergency-crew"

echo "=== Deploying Emergency Crew to $VPS_HOST ==="

# 1. Upload code
echo "[1/4] Uploading files..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'logs' \
    --exclude 'deploy' \
    --exclude 'Doc' \
    client/ server/ assets/ \
    "$VPS_USER@$VPS_HOST:$APP_DIR/"

# 2. Install dependencies
echo "[2/4] Installing dependencies on VPS..."
ssh "$VPS_USER@$VPS_HOST" "cd $APP_DIR/server && npm install --production"

# 3. Fix permissions
echo "[3/4] Setting permissions..."
ssh "$VPS_USER@$VPS_HOST" "chown -R gameserver:gameserver $APP_DIR"

# 4. Restart service
echo "[4/4] Restarting service..."
ssh "$VPS_USER@$VPS_HOST" "systemctl restart emergency-crew"

# Health check
sleep 2
echo ""
echo "Health check:"
curl -s "https://$VPS_HOST/health" && echo ""
echo ""
echo "=== Deploy complete! ==="
echo "Game available at: https://$VPS_HOST"
