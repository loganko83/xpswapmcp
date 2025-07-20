# XPSwap DEX - Production Deployment Guide

## 🚀 Quick Deploy to AWS EC2

This guide explains how to deploy XPSwap DEX to your AWS EC2 instance.

### Prerequisites

- AWS EC2 instance with Ubuntu
- Node.js 18+ and npm installed
- Apache2 with mod_proxy enabled
- PM2 for process management
- Git installed

### Deployment Steps

#### 1. Clone the Repository

```bash
cd /var/www/storage/xpswap
git clone https://github.com/YOUR-USERNAME/xpswap-dex.git .
```

#### 2. Setup Environment

```bash
cp .env.production.example .env
nano .env  # Edit with your configuration
```

#### 3. Install Dependencies

```bash
npm ci --production
```

#### 4. Build the Application

```bash
npm run build
```

#### 5. Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions to enable auto-start
```

#### 6. Configure Apache

The Apache configuration should already be in place at `/etc/apache2/sites-available/xpswap.conf`

#### 7. Access Your DEX

- Main URL: https://trendy.storydot.kr/xpswap/
- Future subdomain: https://xpswap.storydot.kr/

### Updating the Application

To update the application with new changes:

```bash
cd /var/www/storage/xpswap
./deploy.sh
```

### Monitoring

```bash
# View logs
pm2 logs xpswap-api

# Monitor performance
pm2 monit

# Check status
pm2 status
```

### Backup

Backups are automatically created during deployment in `/var/www/storage/backups/xpswap/`

### Troubleshooting

1. **API not responding**
   ```bash
   pm2 restart xpswap-api
   pm2 logs xpswap-api --lines 100
   ```

2. **Apache issues**
   ```bash
   sudo apache2ctl configtest
   sudo systemctl status apache2
   ```

3. **Permission issues**
   ```bash
   sudo chown -R ubuntu:ubuntu /var/www/storage/xpswap
   sudo chown -R www-data:www-data /var/www/storage/xpswap/client/dist
   ```

### Security Notes

- Always use HTTPS in production
- Keep your `.env` file secure and never commit it to Git
- Regularly update dependencies for security patches
- Use strong SESSION_SECRET and JWT_SECRET values
- Enable rate limiting and CORS properly

### Support

For issues and questions, please open an issue on GitHub.
