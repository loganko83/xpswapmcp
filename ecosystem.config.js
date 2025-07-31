module.exports = {
  apps: [{
    name: 'xpswap-api',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      BASE_PATH: '/xpswap'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'client', '.git'],
    max_memory_restart: '500M',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    wait_ready: true,
    listen_timeout: 3000,
    kill_timeout: 5000
  }]
};
