module.exports = {
  apps: [{
    name: 'mxcounter',
    script: 'server.js',
    cwd: '/home/ubuntu/apps/mxcounter',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8765
    },
    error_file: '/home/ubuntu/apps/mxcounter/logs/err.log',
    out_file: '/home/ubuntu/apps/mxcounter/logs/out.log',
    log_file: '/home/ubuntu/apps/mxcounter/logs/combined.log',
    time: true
  }]
};
