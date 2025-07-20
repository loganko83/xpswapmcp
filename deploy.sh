#!/bin/bash

# XPSwap Deployment Script for Production

echo "🚀 Starting XPSwap Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/var/www/storage/xpswap"
BACKUP_DIR="/var/www/storage/backups/xpswap"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to check command success
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# 1. Pull latest changes from Git
echo -e "${YELLOW}Pulling latest changes...${NC}"
cd $DEPLOY_DIR
git pull origin main
check_status "Git pull"

# 2. Backup current deployment
echo -e "${YELLOW}Creating backup...${NC}"
if [ -d "$DEPLOY_DIR/dist" ]; then
    tar -czf "$BACKUP_DIR/backup_${TIMESTAMP}.tar.gz" dist/ client/dist/
    check_status "Backup creation"
fi

# 3. Install/Update dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci --production
check_status "NPM install"

# 4. Build the application
echo -e "${YELLOW}Building application...${NC}"
npm run build
check_status "Build"

# 5. Run database migrations (if any)
echo -e "${YELLOW}Running database migrations...${NC}"
# npm run migrate:production
echo "Skipping migrations for now..."

# 6. Set proper permissions
echo -e "${YELLOW}Setting permissions...${NC}"
sudo chown -R ubuntu:ubuntu $DEPLOY_DIR
sudo chown -R www-data:www-data $DEPLOY_DIR/client/dist
sudo chmod -R 755 $DEPLOY_DIR/client/dist
check_status "Permissions"

# 7. Restart PM2 application
echo -e "${YELLOW}Restarting application...${NC}"
pm2 restart xpswap-api
check_status "PM2 restart"

# 8. Reload Apache
echo -e "${YELLOW}Reloading Apache...${NC}"
sudo systemctl reload apache2
check_status "Apache reload"

# 9. Health check
echo -e "${YELLOW}Performing health check...${NC}"
sleep 3
curl -f http://localhost:5000/api/health > /dev/null 2>&1
check_status "Health check"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "Access your application at: https://trendy.storydot.kr/xpswap/"

# Show PM2 status
pm2 status xpswap-api
